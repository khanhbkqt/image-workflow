# Google Labs Flow API — Reverse Engineering Research

> **Date**: 2026-03-03  
> **Source**: Live traffic capture via injected fetch interceptor on `labs.google/fx/tools/flow`  
> **Status**: ✅ Confirmed working

---

## 1. Overview

**Google Labs Flow** is Google's unified AI creative studio. For image generation it uses the **Nano Banana** family of models. The web app communicates with a single REST-like API hosted at `aisandbox-pa.googleapis.com`.

### Model Identifiers

| UI Name | Internal API Name |
|---|---|
| Nano Banana 2 | `NARWHAL` |
| Nano Banana Pro | `NARWHAL_PRO` *(inferred — needs verification)* |
| Nano Banana 1 | `NARWHAL_1` *(inferred — needs verification)* |

### Tool Identifier
The Flow app identifies itself to the API as: `tool: "PINHOLE"`

---

## 2. Primary Endpoint

### Text-to-Image Generation

```
POST https://aisandbox-pa.googleapis.com/v1/projects/{projectId}/flowMedia:batchGenerateImages
Content-Type: application/json
Authorization: (via Google session cookies — see §4)
```

#### Request Body (Text Only)
```json
{
  "clientContext": {
    "recaptchaContext": {
      "token": "<RECAPTCHA_ENTERPRISE_TOKEN>",
      "applicationType": "RECAPTCHA_APPLICATION_TYPE_WEB"
    },
    "projectId": "<PROJECT_UUID>",
    "tool": "PINHOLE",
    "sessionId": ";<unix_timestamp_ms>"
  },
  "mediaGenerationContext": {
    "batchId": "<BATCH_UUID>"
  },
  "useNewMedia": true,
  "requests": [
    {
      "clientContext": {
        "recaptchaContext": {
          "token": "<RECAPTCHA_ENTERPRISE_TOKEN>"
        },
        "projectId": "<PROJECT_UUID>",
        "tool": "PINHOLE",
        "sessionId": ";<unix_timestamp_ms>"
      },
      "imageModelName": "NARWHAL",
      "imageAspectRatio": "IMAGE_ASPECT_RATIO_LANDSCAPE",
      "structuredPrompt": {
        "parts": [
          { "text": "a futuristic city at night" }
        ]
      },
      "seed": 217715,
      "imageInputs": []
    }
  ]
}
```

---

### Image-to-Image / Reference Image Generation

The key difference is the `imageInputs` array. Images are **pre-uploaded to Google's servers** and referenced by their backend UUID.

#### Request Body (With Reference Image)
```json
{
  "clientContext": { "...": "same as above" },
  "mediaGenerationContext": { "batchId": "<UUID>" },
  "useNewMedia": true,
  "requests": [
    {
      "clientContext": { "...": "same as above" },
      "imageModelName": "NARWHAL",
      "imageAspectRatio": "IMAGE_ASPECT_RATIO_LANDSCAPE",
      "structuredPrompt": {
        "parts": [
          { "text": "a futuristic city with a giant cat" }
        ]
      },
      "seed": 217715,
      "imageInputs": [
        {
          "imageInputType": "IMAGE_INPUT_TYPE_REFERENCE",
          "name": "<ASSET_UUID>"
        }
      ]
    }
  ]
}
```

#### Image Input Types (observed + inferred)
| `imageInputType` | Description |
|---|---|
| `IMAGE_INPUT_TYPE_REFERENCE` | General reference image (observed) |
| `IMAGE_INPUT_TYPE_SUBJECT` *(inferred)* | Subject ingredient (like Whisk subject) |
| `IMAGE_INPUT_TYPE_STYLE` *(inferred)* | Style ingredient |
| `IMAGE_INPUT_TYPE_SCENE` *(inferred)* | Scene ingredient |

#### Multiple Image Inputs
The `imageInputs` array supports multiple entries at the protocol level:
```json
"imageInputs": [
  { "imageInputType": "IMAGE_INPUT_TYPE_REFERENCE", "name": "<UUID_1>" },
  { "imageInputType": "IMAGE_INPUT_TYPE_REFERENCE", "name": "<UUID_2>" }
]
```

---

## 3. Asset Upload Flow

### Upload Endpoint
```
POST https://aisandbox-pa.googleapis.com/v1/flow/uploadImage
Content-Type: text/plain;charset=UTF-8
Authorization: Bearer <OAUTH2_ACCESS_TOKEN>
```

### Upload Request Body
```json
{
  "clientContext": {
    "projectId": "<PROJECT_UUID>",
    "tool": "PINHOLE"
  },
  "imageBytes": "<BASE64_ENCODED_IMAGE_DATA>",
  "isUserUploaded": true,
  "isHidden": false,
  "mimeType": "image/jpeg",
  "fileName": "photo.jpg"
}
```

### Upload Key Facts
| Property | Value |
|---|---|
| No reCAPTCHA required | ✅ Upload only needs Bearer token |
| Image format | Base64-encoded bytes in `imageBytes` |
| Content-Type (unusual) | `text/plain;charset=UTF-8` despite JSON body |
| Auth type | **OAuth2 Bearer token** (NOT session cookies) |

### Upload Response
Returns an asset object containing the backend UUID that must be referenced in `imageInputs[].name` during generation.

### Bearer Token — Critical Finding

> [!IMPORTANT]
> The upload (and presumably generation) API uses an **OAuth2 Bearer token** (`ya29.xxx`) — NOT just browser cookies.
> This token is obtained by the browser using the user's Google auth session via the `gapi.auth2` or `google.accounts.oauth2` JavaScript SDK.

The token can be extracted from the page by intercepting the `Authorization` header or calling the SDK directly from the hidden BrowserView:
```javascript
// Inside the hidden BrowserView webContents
const token = await gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
// OR intercept from an outgoing request
```

### Two-Step Upload + Generate Flow
1. **Upload image** → `POST v1/flow/uploadImage` with base64 bytes → receive asset UUID
2. **Generate** → `POST v1/projects/{id}/flowMedia:batchGenerateImages` with reCAPTCHA token + asset UUID in `imageInputs[]`

---

## 4. Authentication

### Session Cookies Required
The same Google account cookies used to authenticate in the browser are sent automatically. The key cookies are:
- `__Secure-1PSID`
- `__Secure-1PSIDTS`
- `__Secure-3PSID`
- `SID`, `HSID`, `SSID`

### reCAPTCHA Enterprise Token

> [!CAUTION]
> This is the primary integration challenge. Every single request requires a **fresh reCAPTCHA Enterprise token** generated by `grecaptcha.enterprise.execute()` immediately before the fetch call.

**Key facts:**
- Tokens are **per-request** — they change even for requests sent milliseconds apart
- Cannot be reused or replayed
- Generated by the reCAPTCHA JS SDK loaded in the Flow web page

---

## 5. Aspect Ratios

| Enum Value | Description |
|---|---|
| `IMAGE_ASPECT_RATIO_LANDSCAPE` | Landscape (16:9 or similar) |
| `IMAGE_ASPECT_RATIO_PORTRAIT` | Portrait |
| `IMAGE_ASPECT_RATIO_SQUARE` | Square (1:1) |
| `IMAGE_ASPECT_RATIO_WIDESCREEN` | Widescreen (inferred) |

---

## 6. Logging / Telemetry Endpoint

Parallel to generation requests, the app logs telemetry:
```
POST https://aisandbox-pa.googleapis.com/v1:batchLog
```
Events include: `MEDIA_GENERATION`, `FLOW_IMAGE_LATENCY`. This endpoint can be ignored for our purposes.

---

## 7. Recommended Integration Architecture (Electron)

Since reCAPTCHA tokens must be generated by the browser, the cleanest solution for the Electron app is a **hidden BrowserView strategy**:

```
┌─────────────────────────────────────────┐
│          Electron Main Process          │
│                                         │
│  ┌─────────────────┐  ┌──────────────┐  │
│  │  Hidden BrowserView│  │   IPC Bridge │  │
│  │  labs.google/flow │  │              │  │
│  │  (logged-in session│  │  generate()  │  │
│  │  stays alive)    │  │              │  │
│  └────────┬────────┘  └──────┬───────┘  │
│           │                  │           │
│           └──────────────────┘           │
│           webContents.executeJavaScript  │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Renderer Process   │
│  (PromptNode UI)    │
│  window.api.flow()  │
└─────────────────────┘
```

### Integration Steps

1. **Create a hidden `BrowserView`** that loads `https://labs.google/fx/tools/flow` after user auth
2. **Hook the page's fetch** via `webContents.executeJavaScript()` to intercept reCAPTCHA token generation
3. **For each generation request**, inject JS to:
   - Call `grecaptcha.enterprise.execute(SITE_KEY, {action: 'batchGenerateImages'})`  
   - Return the token to the main process
4. **Main process** assembles the full API request with the live token and fires it directly (no browser intermediary needed)
5. **Response** is parsed and images returned to the renderer via IPC

### Alternative: Full BrowserView Proxy
Let the hidden BrowserView drive the entire generation (type prompt → click generate) and intercept the response. Simpler but slower (~3-5s overhead).

---

## 8. Identified Unknowns / Next Steps

- [ ] Capture the **asset/image upload endpoint** to understand how to upload custom images
- [ ] Verify **Nano Banana Pro** model name (`NARWHAL_PRO`?)
- [ ] Test generating with **multiple image inputs** of different types simultaneously
- [ ] Determine the **projectId lifecycle** — is one project per user, or per session?
- [ ] Explore `structuredPrompt.parts` — can it contain `inlineData` (base64 image) directly, bypassing the upload step?

---

## 9. Sample Tokens Captured (for reference format)

```
0cAFcWeA6BeZsZozdrlIWZw7lAL-8jKnZXVm46Bhr8j4M5yEpM...  (T=0ms)
0cAFcWeA6PG6Cw0ud5Gsji0hkzTRE4W0cd9c-WnqUC5HdQ7L30... (T=552ms)
0cAFcWeA5ETV-X-qlLV6EIpImQANXthGFv5gixIeXrzX5ZbEIj... (T=80s)
```
All tokens are unique → confirmed per-request generation.
