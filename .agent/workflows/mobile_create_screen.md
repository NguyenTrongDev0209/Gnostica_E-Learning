---
description: Workflow for adding a new screen to the gnostica-mobile application.
---

When building high-performance mobile interfaces in Gnostica Mobile (React Native + Expo):

### 1. Screen Architecture
- Create specialized screen components in `gnostica-mobile/src/screens/[domain]/`.
- Filenames must be descriptive and end in `Screen` (e.g., `CheckoutScreen.jsx`).
- Avoid "God components". If a screen exceeds 150-200 lines, extract its complex parts into `src/components/`.

### 2. High-Performance Styling (Nativewind)
- Gnostica Mobile uses **Nativewind** with Tailwind CSS capabilities.
- **Performance Alert:** Do not compute dynamic strings via simple concatenation (e.g., `className={"p-4 " + (active ? "bg-red" : "bg-blue")}`). For Nativewind in Expo, runtime dynamic class concatenation can impact rendering. Use utilities like `clsx` or `tailwind-merge` to handle conditional states efficiently.
- Do not mix pure StyleSheet `style={{}}` with `className=""` unless absolutely necessary (like dynamic widths from a dimension API).

### 3. State Management & Navigation
- **Global Data:** Leverage the existing Context Providers (`useAuth()`, `useCart()`) properly. Don't prop-drill deeply if Context fits better.
- **Navigation Flow:** Add the new screen to the Native Stack Navigator in `App.jsx`.
- When navigating, use strongly-typed or explicit route names: `navigation.navigate('ScreenName', { params })`.

### 4. Resilience
- React Native crashes hard on undefined object access in Text components. Always apply strict Optional Chaining (`data?.title`) or provide default fallbacks (`data?.title || 'Unknown'`).
- Always run `npx expo start` or appropriate build commands to verify Nativewind compilation is functional without crashes.
