# Mobile App - Gnostica Mobile Application 📱

> **Mục đích tài liệu:** Chi tiết kỹ thuật của phân hệ Mobile, bao gồm công nghệ, cấu trúc mã nguồn, danh sách màn hình, navigation, quản lý state, và hướng dẫn cấu hình. Dùng để AI hoàn thiện tài liệu và báo cáo.

---

## 1. Thông tin Tổng quan

| Thuộc tính | Giá trị |
|-----------|---------|
| **Framework** | React Native 0.81.5 |
| **Platform** | Expo SDK 54 |
| **Styling** | NativeWind v4 (Tailwind CSS 3.4 cho React Native) |
| **UI Kit** | Gluestack UI |
| **Navigation** | React Navigation v7 |
| **Language** | JavaScript (JSX) |
| **Supported Platforms** | iOS & Android |
| **Entry Point** | `index.js` → `App.jsx` |

---

## 2. Công nghệ & Thư viện Chi tiết

### 2.1 Core Framework
| Thư viện | Version | Mục đích |
|---------|---------|---------|
| `react` | 19.1.0 | UI framework |
| `react-native` | 0.81.5 | Native bridge |
| `expo` | 54.0.33 | Development platform |
| `babel-preset-expo` | 54.0.10 | Babel preset |

### 2.2 Navigation
| Thư viện | Version | Mục đích |
|---------|---------|---------|
| `@react-navigation/native` | 7.2.2 | Navigation core |
| `@react-navigation/native-stack` | 7.14.12 | Native Stack Navigator |
| `@react-navigation/bottom-tabs` | 7.16.1 | Bottom Tab Navigator |
| `react-native-screens` | 4.16.0 | Native screens optimization |
| `react-native-safe-area-context` | 5.7.0 | Safe area handling |

### 2.3 Styling & UI
| Thư viện | Version | Mục đích |
|---------|---------|---------|
| `nativewind` | 4.2.3 | Tailwind CSS cho React Native |
| `tailwindcss` | 3.4.19 | Tailwind core (v3 cho NativeWind) |
| `tailwind-merge` | 3.6.0 | Merge Tailwind classes |
| `clsx` | 2.1.1 | Conditional class names |
| `@gluestack-ui/nativewind` | 0.0.2 | Gluestack UI + NativeWind |
| `@gluestack-ui/overlay` | 0.1.22 | Overlay components |
| `expo-linear-gradient` | 56.0.4 | Gradient backgrounds |
| `lucide-react-native` | 1.11.0 | Icon library |
| `@expo-google-fonts/inter` | 0.4.2 | Inter font |
| `expo-font` | 56.0.7 | Font loading |
| `@react-native-masked-view/masked-view` | 0.3.2 | Masked views |

### 2.4 Media & Interaction
| Thư viện | Version | Mục đích |
|---------|---------|---------|
| `expo-video` | 3.0.16 | Video playback |
| `react-native-video` | 6.19.2 | Video player (alternative) |
| `expo-image-picker` | 15.0.7 | Chọn ảnh từ thư viện/camera |
| `react-native-reanimated` | 4.1.1 | Animations |
| `react-native-svg` | 15.12.1 | SVG rendering |
| `react-native-render-html` | 6.3.4 | Render HTML content |
| `react-native-webview` | 13.15.0 | WebView (payment, rich content) |

### 2.5 Data & Network
| Thư viện | Version | Mục đích |
|---------|---------|---------|
| `axios` | 1.18.0 | HTTP client |
| `@react-native-async-storage/async-storage` | 2.2.0 | Local storage (token, preferences) |

### 2.6 Utilities
| Thư viện | Version | Mục đích |
|---------|---------|---------|
| `expo-linking` | 8.0.12 | Deep linking |
| `expo-web-browser` | 57.0.2 | In-app browser (OAuth) |
| `expo-status-bar` | 3.0.9 | Status bar control |
| `expo-updates` | 29.0.19 | OTA updates |
| `expo-build-properties` | 1.0.10 | Build configuration |
| `react-native-worklets` | 0.5.1 | Worklets (animations) |

---

## 3. Cấu trúc Mã nguồn Chi tiết

```
gnostica-mobile/
├── index.js                # Entry point (registerRootComponent)
├── App.jsx                 # Root component (AuthContext, CartContext, Navigation)
├── app.json                # Expo app manifest
├── app.config.js           # Dynamic Expo config
├── babel.config.js         # Babel configuration (NativeWind)
├── metro.config.cjs        # Metro bundler config
├── tailwind.config.js      # Tailwind CSS config (NativeWind v4)
├── global.css              # Global Tailwind styles
├── eas.json                # EAS Build configuration
│
├── src/
│   ├── config/
│   │   ├── environment.js  # URL tập trung (dev: IP LAN, prod: domain)
│   │   └── api.js          # Axios instance (interceptors, token)
│   │
│   ├── context/
│   │   ├── AuthContext.js   # Auth state (user, token, login, logout)
│   │   ├── CartContext.js   # Shopping cart state
│   │   └── LoadingContext.jsx # Global loading indicator
│   │
│   ├── navigation/
│   │   └── AppNavigator.jsx # Toàn bộ navigation stack
│   │
│   ├── screens/
│   │   ├── auth/           # Đăng nhập, Đăng ký, Quên MK
│   │   ├── home/           # Trang chủ, Tìm kiếm
│   │   ├── course/         # Chi tiết khóa học, Learning space
│   │   ├── checkout/       # Thanh toán
│   │   ├── forum/          # Diễn đàn
│   │   ├── profile/        # Hồ sơ cá nhân
│   │   ├── instructor/     # Trang giảng viên
│   │   └── common/         # Màn hình chung
│   │
│   ├── components/
│   │   ├── ui/             # Gluestack UI components
│   │   └── course/         # Course-specific components
│   │
│   ├── services/
│   │   ├── auth/           # Auth API calls
│   │   ├── course/         # Course API calls
│   │   ├── checkout/       # Checkout API calls
│   │   ├── forum/          # Forum API calls
│   │   ├── home/           # Home data API
│   │   ├── instructor/     # Instructor API
│   │   └── profile/        # Profile API
│   │
│   ├── hooks/              # Custom hooks
│   ├── constants/          # App constants
│   ├── styles/             # Shared styles
│   ├── assets/             # Images, fonts
│   └── utils/              # Utility functions
```

---

## 4. Navigation Structure

### 4.1 Tổng quan

```
AppNavigator (Stack Navigator)
├── Auth Stack (khi chưa đăng nhập)
│   ├── LoginScreen
│   ├── RegisterScreen
│   ├── ForgotPasswordScreen
│   └── ConfirmCodeScreen
│
├── Main Tabs (Bottom Tab Navigator, khi đã đăng nhập)
│   ├── Home Tab
│   │   ├── HomeScreen
│   │   └── SearchScreen
│   ├── Courses Tab
│   │   ├── CourseListScreen
│   │   ├── CourseDetailScreen
│   │   └── LearningScreen
│   ├── Forum Tab
│   │   ├── ForumListScreen
│   │   └── ForumDetailScreen
│   └── Profile Tab
│       ├── ProfileScreen
│       ├── SettingsScreen
│       └── InstructorScreen
│
└── Standalone Screens (modal/push)
    ├── CheckoutScreen
    ├── PaymentWebViewScreen
    ├── NotificationScreen
    ├── CertificateScreen
    ├── AiChatScreen (Trợ lý AI — chat với AI qua REST, quota 15 lượt/ngày)
    └── ... (Cart, Orders, Refund, Gift, Vouchers, Support, LearningProgress, MyCourses...)
```

### 4.2 File Navigation: `AppNavigator.jsx`

- Sử dụng `NavigationContainer` với `react-native-screens`
- Conditional rendering: Auth Stack vs Main Tabs dựa trên `AuthContext`
- Bottom Tabs: 4 tab chính (Home, Courses, Forum, Profile)
- Deep linking scheme: `gnostica://`

---

## 5. Quản lý State

### 5.1 So sánh với Web

| Aspect | Web (gnostica-web) | Mobile (gnostica-mobile) |
|--------|-------------------|-------------------------|
| **Global State** | Zustand (`useAuthStore`) | React Context (`AuthContext`) |
| **Server State** | React Query v5 | Manual (Axios + useState) |
| **Form State** | React Hook Form + Zod | useState (native) |
| **Cart** | (in server state) | React Context (`CartContext`) |
| **Loading** | React Query states | React Context (`LoadingContext`) |
| **Token Storage** | localStorage | AsyncStorage |

### 5.2 AuthContext

```javascript
// AuthContext.js provides:
{
  user,           // Current user object
  token,          // JWT access token
  isAuthenticated,// Boolean
  login(userData, token),
  logout(),
  updateUser(userData),
}
```

### 5.3 CartContext

```javascript
// CartContext.js provides:
{
  cartItems,      // Array of course items
  addToCart(course),
  removeFromCart(courseId),
  clearCart(),
  cartCount,      // Number of items
}
```

---

## 6. Cấu hình Môi trường

### 6.1 File `.env`

```env
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_DEV_API_HOST=192.168.1.10      # IP LAN máy chạy backend
EXPO_PUBLIC_OAUTH_REDIRECT_URI=gnostica://auth/callback
```

### 6.2 Mapping URL

| Biến | `development` | `production` |
|------|-------------|-------------|
| `API_URL` | `http://<DEV_API_HOST>:8080/api` | `https://gnostica.io.vn/api` |
| `WS_URL` | `http://<DEV_API_HOST>:8080/ws` | `https://gnostica.io.vn/ws` |

> **Lưu ý**: `WS_URL` đã được khai báo trong `environment.js` nhưng hiện tại **chưa có client sử dụng** — mobile chưa có messaging realtime (chỉ có AI chat qua REST). Khi triển khai messaging trên mobile cần thêm thư viện WebSocket/STOMP.

### 6.3 Lưu ý Quan trọng

1. **Không dùng `localhost`** trên thiết bị thật — phải dùng IP LAN
2. **Google OAuth** luôn qua `https://gnostica.io.vn/api/...` kể cả dev mode (vì Google callback cần HTTPS public domain)
3. **Không đặt secret** vào biến `EXPO_PUBLIC_*` (bị đóng gói vào app)
4. **Sau khi đổi `.env`**: Dừng Expo → chạy lại `npm start` hoặc `npx expo start --clear`

---

## 7. Cấu hình EAS Build (`eas.json`)

```json
{
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview": { "distribution": "internal" },
    "production": {}
  }
}
```

---

## 8. Khác biệt Chính so với Web

| Feature | Web | Mobile |
|---------|-----|--------|
| **Video Player** | HTML5 Video / iframe | Expo Video / RN Video |
| **File Upload** | `<input type="file">` + TUS | `expo-image-picker` |
| **Deep Linking** | URL routing | `gnostica://` scheme |
| **Notifications** | WebSocket (browser) | Push + WebSocket |
| **Certificate** | HTML → Canvas → PDF | WebView / Share |
| **Rich Text** | React Quill New | `react-native-render-html` |
| **Payment** | Inline QR / Redirect | WebView for QR / Payment |
| **Admin Dashboard** | Có (15+ pages) | Không có |
| **Instructor Dashboard** | Có (8+ pages) | Giới hạn |
| **Trợ lý AI (Chat)** | Có | Có (`AiChatScreen`, REST `POST /ai/chat`) |
| **Nhắn tin (Messaging)** | Có (`/account/messages`, `/instructor/messages`) | Chưa có |

---

## 9. Chạy Ứng dụng

### Development (Expo Go)
```bash
cd gnostica-mobile
npm install
cp .env.example .env
# Edit .env: set EXPO_PUBLIC_DEV_API_HOST to your LAN IP
npx expo start
# Scan QR code with Expo Go app
```

### Development Build
```bash
npx expo run:android   # Android
npx expo run:ios       # iOS (macOS only)
```

### EAS Build
```bash
eas build --platform android --profile preview
eas build --platform ios --profile preview
```
