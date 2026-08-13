# Plan: Tích hợp "Embed view token authentication" (Bunny Stream)

## 1. Bối cảnh

Hệ thống dùng Bunny Stream (library `655066`) để lưu trữ và phát video khóa học.
Trên dashboard Bunny (Security → General), hiện đang bật **"Block direct url file
access"** nhưng **"Embed view token authentication" đang tắt** — tức mọi embed
`player.mediadelivery.net/embed/...` đều chơi được nếu có Referer hợp lệ, không
cần token.

Mục tiêu: tích hợp sẵn trong code để khi bật toggle trên Bunny, toàn bộ luồng
phát video vẫn hoạt động nhờ **server tự ký embed URL** (không bao giờ lộ key
xuống client).

## 2. Cơ chế token của Bunny (chuẩn chính thức)

- URL embed có dạng:
  `https://player.mediadelivery.net/embed/{libraryId}/{videoId}?token={hex}&expires={unix}`
- `token` = chữ thường hex của `SHA256(token_security_key + videoId + expires)`.
- `token_security_key` = **Video Library API Key** (theo docs `stream/token-authentication`
  và `stream/mobile-sdk-token-authentication`). Trong dashboard nó chính là ô
  "Token authentication key / API key".
- `expires` = UNIX timestamp (giây); nên dùng ngắn (5–10 phút).
- Khi bật tính năng, request embed thiếu `token`/`expires` hợp lệ sẽ bị 403.

Lưu ý: "Embed view token" **khác** với "CDN token" (`bcdn_token=HS256-...` —
đã có sẵn trong `LessonPlaybackService.signHlsUrl`, bật qua `cdnTokenEnabled`).

## 3. Khảo sát hiện trạng (trước khi sửa)

| Thành phần | Cách lấy URL embed | Ảnh hưởng khi bật token |
|---|---|---|
| Server `LessonPlaybackService.resolve()` | Trả `sourceUrl` (HLS đã ký CDN) + `embedUrl` **chưa ký** | `embedUrl` bị 403 |
| Web `LearningWorkspace` | **Tự dựng client-side** `getEmbedUrl(videoUrl)`, không gọi playback API | 403 |
| Web `CourseDetail` (promo trailer) | Tự dựng client-side | 403 |
| Web `AdminCourseDetailModeration` (preview) | Tự dựng client-side | 403 |
| Mobile `LearningScreen` | Gọi `getLessonPlayback` → có `data.embedUrl` nhưng **không truyền** vào `VideoPlayer` | WebView embed 403, rơi về native HLS |
| Mobile `CourseDetailScreen` (promo) | `VideoPlayer source={promoVideo}` tự dựng client-side | 403 |

## 4. Thay đổi đã triển khai

### Server (`gnostica-server`)

- `BunnyNetConfig`: thêm `embedTokenEnabled`, `embedTokenTtlSeconds`, `embedTokenKey`
  (override; mặc định fallback về `apiKey` = Video Library API Key).
- `LessonPlaybackService`:
  - `signEmbedUrl(embedUrl, videoId)`: ký embed bằng SHA256 hex theo chuẩn Bunny,
    chỉ chạy khi `embedTokenEnabled=true`.
  - `resolve()`: ký `embedUrl` trước khi trả về.
  - `resolveSignedEmbed(storedUrl)`: method dùng chung (promo + admin) để ký embed
    cho một URL video bất kỳ, không cần kiểm tra enrollment.
- `CourseController`: endpoint public `GET /api/courses/{slug}/promo-playback`
  trả `{ provider, embedUrl, sourceUrl }` cho trailer (permitAll theo
  `SecurityConfig`, chỉ hoạt động với khóa học public).
- `AdminCourseController`: endpoint admin `POST /api/admin/courses/signed-embed`
  (`@PreAuthorize("hasRole('ADMIN')")`) để admin xem trước video khóa học đang
  kiểm duyệt (kể cả khóa chưa public).
- `application.properties` + `.env.example`: thêm
  `BUNNY_EMBED_TOKEN_ENABLED`, `BUNNY_EMBED_TOKEN_KEY`, `BUNNY_EMBED_TOKEN_TTL_SECONDS`.

### Web (`gnostica-web`)

- `courseService.js`: thêm `getLessonPlayback(lessonId)` và `getPromoPlayback(slug)`.
- `adminCourseService.js`: thêm `getSignedEmbed(videoUrl)`.
- `LearningWorkspace`: gọi `getLessonPlayback` cho bài học hiện tại, dùng
  `embedUrl` từ server cho iframe; giữ fallback client cho provider ngoài
  (YouTube/Vimeo). Khi là video Bunny và chưa có URL ký từ server thì hiển thị
  spinner thay vì tải URL chưa ký (tránh 403 flash).
- `CourseDetail` (`CourseDetailVideo`): nhận thêm `slug`, fetch signed URL khi mở
  dialog trailer.
- `AdminCourseDetailModeration`: fetch signed embed (cache theo URL) cho preview
  bài học + promo.

### Mobile (`gnostica-mobile`)

- `VideoPlayer`: thêm prop `embedUrl` (URL ký từ server được ưu tiên; nếu không
  có mới tự dựng client-side cho provider ngoài).
- `LearningScreen`: truyền `embedUrl={playback.embedSource}` (vốn có sẵn trong
  response playback API).
- `CourseDetailScreen`: fetch `getPromoPlayback(slug)` khi mở trailer, truyền vào
  `VideoPlayer`.
- `courseService.js`: thêm `getPromoPlayback(slug)`.

## 5. Cách bật tính năng (rollout)

1. Đặt biến môi trường cho `gnostica-server` (được nạp qua
   `docker/docker-compose.production.yml` → `env_file: ../gnostica-server/.env`):
   ```
   BUNNY_EMBED_TOKEN_ENABLED=true
   # BUNNY_EMBED_TOKEN_KEY=        # chỉ cần nếu xoay key riêng, mặc định dùng BUNNY_STREAM_API_KEY
   BUNNY_EMBED_TOKEN_TTL_SECONDS=600
   ```
2. Trên Bunny dashboard → Stream → Security → General, bật **"Embed view token
   authentication"**.
3. Deploy lại `gnostica-server` (để ký URL) — nên deploy server trước, rồi bật
   toggle trên Bunny để tránh khoảng trống 403.
4. Kiểm tra: mở khóa học đã mua (web + mobile), mở trailer khóa học, và mở trang
   kiểm duyệt admin.

## 6. Giới hạn / điểm cần lưu ý

- **Thumbnail**: URL `https://vz-{libraryId}.b-cdn.net/{videoId}/thumbnail.jpg`
  dùng trong danh sách bài học là truy cập CDN, chỉ bị chặn khi bật **CDN token
  authentication** (toggle riêng). Nếu sau này bật CDN token, cần ký luôn thumbnail.
- **Forum nhúng iframe thủ công**: nội dung forum dạng rich-text có thể chứa
  `<iframe src="https://player.mediadelivery.net/embed/655066/...">` (xem seed
  `seed_04_forum_thread_data.sql`). Đây là nội dung tĩnh do user đăng — không thể
  tự ký; khi bật token, các iframe này sẽ 403 cho tới khi được thay bằng URL ký.
- **Key không bao giờ xuất hiện ở client**: chỉ server ký; client chỉ nhận URL
  ngắn hạn. `BUNNY_EMBED_TOKEN_KEY`/`BUNNY_STREAM_API_KEY` phải giữ bí mật.
- **Thời gian sống token**: mặc định 600s; nếu thời lượng bài học dài hơn, player
  Bunny tự load lại segment qua URL mới (nếu cần có thể tăng TTL).
