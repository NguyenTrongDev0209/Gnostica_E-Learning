$base = "src\main\java\com\gnostica"
$courseDirs = @(
    "$base\modules\course\controller",
    "$base\modules\course\dto\request",
    "$base\modules\course\dto\response",
    "$base\modules\course\service\impl"
)

# Create directories
foreach ($d in $courseDirs) {
    New-Item -ItemType Directory -Path $d -Force | Out-Null
}

# Controllers
$controllers = @(
    "AdminCourseController.java",
    "CategoryController.java",
    "CertificateController.java",
    "CourseController.java",
    "DraftCourseController.java",
    "EnrollmentController.java",
    "LessonProgressController.java",
    "api\instructor\QuestionBankController.java"
)

# Request DTOs
$requests = @(
    "CategoryRequest.java",
    "CourseRequest.java",
    "LessonRequest.java",
    "ModuleRequest.java",
    "QuizRequest.java",
    "QuizSubmitRequest.java"
)

# Response DTOs
$responses = @(
    "AttachmentResponse.java",
    "CategoryResponseDTO.java",
    "CertificateDTO.java",
    "CourseDetailResponse.java",
    "CourseProgressResponse.java",
    "CourseResponse.java",
    "EnrollmentDTO.java",
    "LessonProgressDTO.java",
    "LessonResponse.java",
    "ModuleResponse.java",
    "QuestionDto.java",
    "QuizResponse.java",
    "QuizResultDTO.java"
)

# Services
$services = @(
    "CategoryService.java",
    "CourseService.java",
    "DraftCourseService.java",
    "EnrollmentService.java",
    "LessonProgressService.java",
    "QuestionBankService.java",
    "QuizResultService.java",
    "QuizService.java",
    "RedisDraftService.java"
)

# Move Files
foreach ($c in $controllers) {
    $src = "$base\controller\$c"
    if (Test-Path $src) { Move-Item $src "$base\modules\course\controller\" -Force }
}
foreach ($r in $requests) {
    $src = "$base\dto\request\$r"
    if (Test-Path $src) { Move-Item $src "$base\modules\course\dto\request\" -Force }
}
foreach ($r in $responses) {
    $src = "$base\dto\response\$r"
    if (Test-Path $src) { Move-Item $src "$base\modules\course\dto\response\" -Force }
}
foreach ($s in $services) {
    $src = "$base\service\$s"
    if (Test-Path $src) { Move-Item $src "$base\modules\course\service\" -Force }
    # Also move impl
    $impl = $s.Replace(".java", "Impl.java")
    $srcImpl = "$base\service\impl\$impl"
    if (Test-Path $srcImpl) { Move-Item $srcImpl "$base\modules\course\service\impl\" -Force }
}

# Also remove api/instructor if empty
$apiDir = "$base\controller\api\instructor"
if (Test-Path $apiDir) {
    if ((Get-ChildItem -Force $apiDir | Measure-Object).Count -eq 0) {
        Remove-Item $apiDir -Recurse -Force
    }
}

# Update content in all java files
$allJavaFiles = Get-ChildItem -Path $base -Recurse -Filter "*.java" | Select-Object -ExpandProperty FullName

# Generate replacements for package names
$ctrlMatch = "AdminCourseController\.java|CategoryController\.java|CertificateController\.java|CourseController\.java|DraftCourseController\.java|EnrollmentController\.java|LessonProgressController\.java|QuestionBankController\.java"
$reqMatch = "CategoryRequest\.java|CourseRequest\.java|LessonRequest\.java|ModuleRequest\.java|QuizRequest\.java|QuizSubmitRequest\.java"
$resMatch = "AttachmentResponse\.java|CategoryResponseDTO\.java|CertificateDTO\.java|CourseDetailResponse\.java|CourseProgressResponse\.java|CourseResponse\.java|EnrollmentDTO\.java|LessonProgressDTO\.java|LessonResponse\.java|ModuleResponse\.java|QuestionDto\.java|QuizResponse\.java|QuizResultDTO\.java"
$srvMatch = "CategoryService\.java|CourseService\.java|DraftCourseService\.java|EnrollmentService\.java|LessonProgressService\.java|QuestionBankService\.java|QuizResultService\.java|QuizService\.java|RedisDraftService\.java"
$srvImplMatch = "CategoryServiceImpl\.java|CourseServiceImpl\.java|DraftCourseServiceImpl\.java|EnrollmentServiceImpl\.java|LessonProgressServiceImpl\.java|QuestionBankServiceImpl\.java|QuizResultServiceImpl\.java|QuizServiceImpl\.java|RedisDraftServiceImpl\.java"

$replacements = @(
    # Package declarations
    @{ From = 'package com.gnostica.controller;'; To = 'package com.gnostica.modules.course.controller;'; FileMatch = $ctrlMatch },
    @{ From = 'package com.gnostica.controller.api.instructor;'; To = 'package com.gnostica.modules.course.controller;'; FileMatch = 'QuestionBankController\.java' },
    @{ From = 'package com.gnostica.dto.request;'; To = 'package com.gnostica.modules.course.dto.request;'; FileMatch = $reqMatch },
    @{ From = 'package com.gnostica.dto.response;'; To = 'package com.gnostica.modules.course.dto.response;'; FileMatch = $resMatch },
    @{ From = 'package com.gnostica.service;'; To = 'package com.gnostica.modules.course.service;'; FileMatch = $srvMatch },
    @{ From = 'package com.gnostica.service.impl;'; To = 'package com.gnostica.modules.course.service.impl;'; FileMatch = $srvImplMatch },

    # Global Imports - Controllers
    @{ From = 'import com.gnostica.controller.AdminCourseController;'; To = 'import com.gnostica.modules.course.controller.AdminCourseController;' },
    @{ From = 'import com.gnostica.controller.CategoryController;'; To = 'import com.gnostica.modules.course.controller.CategoryController;' },
    @{ From = 'import com.gnostica.controller.CertificateController;'; To = 'import com.gnostica.modules.course.controller.CertificateController;' },
    @{ From = 'import com.gnostica.controller.CourseController;'; To = 'import com.gnostica.modules.course.controller.CourseController;' },
    @{ From = 'import com.gnostica.controller.DraftCourseController;'; To = 'import com.gnostica.modules.course.controller.DraftCourseController;' },
    @{ From = 'import com.gnostica.controller.EnrollmentController;'; To = 'import com.gnostica.modules.course.controller.EnrollmentController;' },
    @{ From = 'import com.gnostica.controller.LessonProgressController;'; To = 'import com.gnostica.modules.course.controller.LessonProgressController;' },
    @{ From = 'import com.gnostica.controller.api.instructor.QuestionBankController;'; To = 'import com.gnostica.modules.course.controller.QuestionBankController;' }
)

# Add imports for Request DTOs
foreach ($r in $requests) {
    $className = $r.Replace(".java", "")
    $replacements += @{ From = "import com.gnostica.dto.request.$className;"; To = "import com.gnostica.modules.course.dto.request.$className;" }
}

# Add imports for Response DTOs
foreach ($r in $responses) {
    $className = $r.Replace(".java", "")
    $replacements += @{ From = "import com.gnostica.dto.response.$className;"; To = "import com.gnostica.modules.course.dto.response.$className;" }
}

# Add imports for Services & Impl
foreach ($s in $services) {
    $className = $s.Replace(".java", "")
    $implName = $className + "Impl"
    $replacements += @{ From = "import com.gnostica.service.$className;"; To = "import com.gnostica.modules.course.service.$className;" }
    $replacements += @{ From = "import com.gnostica.service.impl.$implName;"; To = "import com.gnostica.modules.course.service.impl.$implName;" }
}

# Address wildcards
$replacements += @{ From = 'import com.gnostica.dto.response.*;'; To = "import com.gnostica.dto.response.*;`r`nimport com.gnostica.modules.course.dto.response.*;" }
$replacements += @{ From = 'import com.gnostica.dto.request.*;'; To = "import com.gnostica.dto.request.*;`r`nimport com.gnostica.modules.course.dto.request.*;" }

$totalChanges = 0
foreach ($file in $allJavaFiles) {
    $content = Get-Content $file -Raw
    $originalContent = $content
    
    foreach ($r in $replacements) {
        if ($r.FileMatch) {
            if ($file -match $r.FileMatch) {
                $content = $content.Replace($r.From, $r.To)
            }
        } else {
            $content = $content.Replace($r.From, $r.To)
        }
    }
    
    # Fix double-packages just in case
    $content = $content.Replace('com.gnostica.modules.course.modules.course.', 'com.gnostica.modules.course.')
    # Clean up duplicate wildcard imports
    $content = $content -replace '(?s)(import com\.gnostica\.modules\.course\.dto\.response\.\*;.*?)\1', '$1'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file -Value $content -NoNewline
        $totalChanges++
        Write-Output "Updated: $($file.Replace((Get-Location).Path + '\', ''))"
    }
}
Write-Output ""
Write-Output "Total files updated: $totalChanges"
