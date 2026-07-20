import { z } from "zod";

export const viErrorMap = (issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.received === "null" || issue.received === "undefined") {
      return { message: "Trường này không được để trống" };
    }
    const typeMap = {
      string: "chuỗi ký tự",
      number: "con số",
      boolean: "giá trị đúng/sai",
      array: "danh sách",
      object: "đối tượng",
    };
    return {
      message: `Dữ liệu không hợp lệ (Mong đợi ${typeMap[issue.expected] || issue.expected}, nhưng nhận được ${typeMap[issue.received] || issue.received})`
    };
  }

  if (issue.code === z.ZodIssueCode.too_small) {
    if (issue.type === "string") return { message: "Vui lòng nhập thông tin này" };
    if (issue.type === "array") return { message: "Cần ít nhất một mục trong danh sách" };
    if (issue.type === "number") return { message: "Giá trị quá nhỏ" };
  }

  if (issue.code === z.ZodIssueCode.invalid_enum_value || issue.code === z.ZodIssueCode.invalid_union) {
    return { message: "Lựa chọn không hợp lệ hoặc dữ liệu chưa đúng định dạng" };
  }

  return { message: ctx.defaultError === "Required" ? "Thông tin này là bắt buộc" : ctx.defaultError };
};

z.setErrorMap(viErrorMap);

const lessonSchema = z.object({
  id: z.any().optional(),
  title: z.coerce.string({ required_error: "Tên bài học không được để trống" })
    .min(1, "Tên bài học không được để trống"),
  content: z.coerce.string({ required_error: "Mô tả bài học không được để trống" })
    .min(1, "Mô tả nội dung bài học không được để trống"),
  videoFile: z.any({ required_error: "Video bài học không được để trống" })
    .refine(val => val !== null && val !== undefined && val !== "", "Video bài học không được để trống"),
  videoUrl: z.string().optional(),
  status: z.coerce.number().default(1),
  createdAt: z.any().nullable().optional(),
  updatedAt: z.any().nullable().optional(),
});

const sectionSchema = z.object({
  id: z.any().optional(),
  title: z.coerce.string({ required_error: "Tên chương không được để trống" })
    .min(1, "Tên chương không được để trống"),
  lessons: z.preprocess(
    (val) => (Array.isArray(val) ? val : []),
    z.array(lessonSchema).min(1, "Chương này phải có ít nhất 1 bài học")
  ),
  attachments: z.any().nullable().optional(),
  status: z.coerce.number().default(1),
  createdAt: z.any().nullable().optional(),
  updatedAt: z.any().nullable().optional(),
  quiz: z.any().nullable().optional(),
});

export const courseSchema = z.object({
  id: z.any().optional(),
  title: z.preprocess((val) => (val === null || val === undefined ? "" : String(val)),
    z.string({ required_error: "Tên khóa học là bắt buộc" }).min(1, "Tên khóa học là bắt buộc")
  ),
  slug: z.preprocess((val) => (val === null || val === undefined ? "" : String(val)),
    z.string({ required_error: "Slug không được để trống" }).min(1, "Slug không được để trống")
  ),
  categoryId: z.preprocess((val) => (val === null || val === undefined ? "" : String(val)),
    z.string({ required_error: "Vui lòng chọn danh mục khóa học" }).min(1, "Vui lòng chọn danh mục khóa học")
  ),
  level: z.preprocess((val) => (val === null || val === undefined ? "" : String(val)),
    z.string({ required_error: "Vui lòng chọn cấp độ khó" }).min(1, "Vui lòng chọn cấp độ khó")
  ),
  description: z.preprocess((val) => (val === null || val === undefined ? "" : String(val)),
    z.string({ required_error: "Mô tả khóa học không được để trống" })
      .min(1, "Mô tả khóa học không được để trống")
      .refine(val => val.replace(/<[^>]*>?/gm, '').trim().length > 0, "Mô tả khóa học không được để trống")
  ),
  price: z.preprocess((val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number({ required_error: "Giá bán không được để trống" })
      .min(0, "Giá phải lớn hơn hoặc bằng 0")
  ),
  discount: z.coerce.number({ invalid_type_error: "Giảm giá phải là số" })
    .min(0, "Giảm giá không được nhỏ hơn 0")
    .max(100, "Giảm giá không được quá 100%")
    .default(0),
  status: z.coerce.number().default(1),
  sections: z.preprocess(
    (val) => (Array.isArray(val) ? val : []),
    z.array(sectionSchema).min(1, "Cần có ít nhất 1 chương học")
  ),
  thumbnail: z.any({ required_error: "Ảnh đại diện khóa học không được để trống" })
    .refine(val => val !== null && val !== undefined && val !== "", "Ảnh đại diện khóa học không được để trống"),
  promoVideo: z.any().nullable().optional(),
  createdAt: z.any().nullable().optional(),
  updatedAt: z.any().nullable().optional(),
  questionBank: z.any().nullable().optional(),
  draftToken: z.any().nullable().optional(),
});
