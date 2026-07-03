$base = "src\main\java\com\gnostica"
$userDirs = @(
    "$base\modules\user\controller",
    "$base\modules\user\dto\request",
    "$base\modules\user\dto\response",
    "$base\modules\user\service\impl"
)

# Create directories
foreach ($d in $userDirs) {
    New-Item -ItemType Directory -Path $d -Force | Out-Null
}

# Move files
$filesToMove = @(
    @{ Path = "$base\controller\InstructorApplicationController.java"; Dest = "$base\modules\user\controller\" },
    @{ Path = "$base\controller\InstructorDashboardController.java"; Dest = "$base\modules\user\controller\" },
    @{ Path = "$base\controller\InstructorProfileController.java"; Dest = "$base\modules\user\controller\" },
    @{ Path = "$base\controller\api\instructor\InstructorStudentController.java"; Dest = "$base\modules\user\controller\" },
    @{ Path = "$base\controller\FollowingController.java"; Dest = "$base\modules\user\controller\" },
    @{ Path = "$base\controller\FavouriteController.java"; Dest = "$base\modules\user\controller\" },
    @{ Path = "$base\controller\NotificationController.java"; Dest = "$base\modules\user\controller\" },
    
    @{ Path = "$base\dto\request\InstructorApplicationRequest.java"; Dest = "$base\modules\user\dto\request\" },
    @{ Path = "$base\dto\request\RejectApplicationRequest.java"; Dest = "$base\modules\user\dto\request\" },
    @{ Path = "$base\dto\PersonalizationDTO.java"; Dest = "$base\modules\user\dto\request\" },
    
    @{ Path = "$base\dto\response\InstructorApplicationResponse.java"; Dest = "$base\modules\user\dto\response\" },
    @{ Path = "$base\dto\response\InstructorStatsResponse.java"; Dest = "$base\modules\user\dto\response\" },
    @{ Path = "$base\dto\response\InstructorDashboardStatsDTO.java"; Dest = "$base\modules\user\dto\response\" },
    @{ Path = "$base\dto\response\InstructorQuestionDTO.java"; Dest = "$base\modules\user\dto\response\" },
    @{ Path = "$base\dto\response\InstructorReviewDTO.java"; Dest = "$base\modules\user\dto\response\" },
    @{ Path = "$base\dto\response\InstructorStudentDTO.java"; Dest = "$base\modules\user\dto\response\" },
    @{ Path = "$base\dto\response\StudentStatsResponse.java"; Dest = "$base\modules\user\dto\response\" },
    
    @{ Path = "$base\service\InstructorApplicationService.java"; Dest = "$base\modules\user\service\" },
    @{ Path = "$base\service\impl\InstructorApplicationServiceImpl.java"; Dest = "$base\modules\user\service\impl\" },
    @{ Path = "$base\service\InstructorDashboardService.java"; Dest = "$base\modules\user\service\" },
    @{ Path = "$base\service\impl\InstructorDashboardServiceImpl.java"; Dest = "$base\modules\user\service\impl\" },
    @{ Path = "$base\service\FollowingService.java"; Dest = "$base\modules\user\service\" },
    @{ Path = "$base\service\impl\FollowingServiceImpl.java"; Dest = "$base\modules\user\service\impl\" },
    @{ Path = "$base\service\FavouriteService.java"; Dest = "$base\modules\user\service\" },
    @{ Path = "$base\service\NotificationService.java"; Dest = "$base\modules\user\service\" }
)

foreach ($f in $filesToMove) {
    if (Test-Path $f.Path) {
        Move-Item $f.Path $f.Dest -Force
    } else {
        Write-Output "Warning: Not found $($f.Path)"
    }
}

# Also cleanup the api/instructor folder if it's empty
$instructorApiDir = "$base\controller\api\instructor"
if (Test-Path $instructorApiDir) {
    if ((Get-ChildItem $instructorApiDir | Measure-Object).Count -eq 0) {
        Remove-Item $instructorApiDir -Recurse -Force
    }
}

# Update content in all java files
$allJavaFiles = Get-ChildItem -Path $base -Recurse -Filter "*.java" | Select-Object -ExpandProperty FullName

$replacements = @(
    # Package declarations
    @{ From = 'package com.gnostica.controller;'; To = 'package com.gnostica.modules.user.controller;'; FileMatch = 'InstructorApplicationController\.java|InstructorDashboardController\.java|InstructorProfileController\.java|FollowingController\.java|FavouriteController\.java|NotificationController\.java' },
    @{ From = 'package com.gnostica.controller.api.instructor;'; To = 'package com.gnostica.modules.user.controller;'; FileMatch = 'InstructorStudentController\.java' },
    @{ From = 'package com.gnostica.dto.request;'; To = 'package com.gnostica.modules.user.dto.request;'; FileMatch = 'InstructorApplicationRequest\.java|RejectApplicationRequest\.java' },
    @{ From = 'package com.gnostica.dto;'; To = 'package com.gnostica.modules.user.dto.request;'; FileMatch = 'PersonalizationDTO\.java' },
    @{ From = 'package com.gnostica.dto.response;'; To = 'package com.gnostica.modules.user.dto.response;'; FileMatch = 'InstructorApplicationResponse\.java|InstructorStatsResponse\.java|InstructorDashboardStatsDTO\.java|InstructorQuestionDTO\.java|InstructorReviewDTO\.java|InstructorStudentDTO\.java|StudentStatsResponse\.java' },
    @{ From = 'package com.gnostica.service;'; To = 'package com.gnostica.modules.user.service;'; FileMatch = 'InstructorApplicationService\.java|InstructorDashboardService\.java|FollowingService\.java|FavouriteService\.java|NotificationService\.java' },
    @{ From = 'package com.gnostica.service.impl;'; To = 'package com.gnostica.modules.user.service.impl;'; FileMatch = 'InstructorApplicationServiceImpl\.java|InstructorDashboardServiceImpl\.java|FollowingServiceImpl\.java' },

    # Imports updates across all project files
    @{ From = 'import com.gnostica.controller.InstructorApplicationController;'; To = 'import com.gnostica.modules.user.controller.InstructorApplicationController;' },
    @{ From = 'import com.gnostica.controller.InstructorDashboardController;'; To = 'import com.gnostica.modules.user.controller.InstructorDashboardController;' },
    @{ From = 'import com.gnostica.controller.InstructorProfileController;'; To = 'import com.gnostica.modules.user.controller.InstructorProfileController;' },
    @{ From = 'import com.gnostica.controller.api.instructor.InstructorStudentController;'; To = 'import com.gnostica.modules.user.controller.InstructorStudentController;' },
    @{ From = 'import com.gnostica.controller.FollowingController;'; To = 'import com.gnostica.modules.user.controller.FollowingController;' },
    @{ From = 'import com.gnostica.controller.FavouriteController;'; To = 'import com.gnostica.modules.user.controller.FavouriteController;' },
    @{ From = 'import com.gnostica.controller.NotificationController;'; To = 'import com.gnostica.modules.user.controller.NotificationController;' },

    @{ From = 'import com.gnostica.dto.request.InstructorApplicationRequest;'; To = 'import com.gnostica.modules.user.dto.request.InstructorApplicationRequest;' },
    @{ From = 'import com.gnostica.dto.request.RejectApplicationRequest;'; To = 'import com.gnostica.modules.user.dto.request.RejectApplicationRequest;' },
    @{ From = 'import com.gnostica.dto.PersonalizationDTO;'; To = 'import com.gnostica.modules.user.dto.request.PersonalizationDTO;' },
    
    @{ From = 'import com.gnostica.dto.response.InstructorApplicationResponse;'; To = 'import com.gnostica.modules.user.dto.response.InstructorApplicationResponse;' },
    @{ From = 'import com.gnostica.dto.response.InstructorStatsResponse;'; To = 'import com.gnostica.modules.user.dto.response.InstructorStatsResponse;' },
    @{ From = 'import com.gnostica.dto.response.InstructorDashboardStatsDTO;'; To = 'import com.gnostica.modules.user.dto.response.InstructorDashboardStatsDTO;' },
    @{ From = 'import com.gnostica.dto.response.InstructorQuestionDTO;'; To = 'import com.gnostica.modules.user.dto.response.InstructorQuestionDTO;' },
    @{ From = 'import com.gnostica.dto.response.InstructorReviewDTO;'; To = 'import com.gnostica.modules.user.dto.response.InstructorReviewDTO;' },
    @{ From = 'import com.gnostica.dto.response.InstructorStudentDTO;'; To = 'import com.gnostica.modules.user.dto.response.InstructorStudentDTO;' },
    @{ From = 'import com.gnostica.dto.response.StudentStatsResponse;'; To = 'import com.gnostica.modules.user.dto.response.StudentStatsResponse;' },

    @{ From = 'import com.gnostica.service.InstructorApplicationService;'; To = 'import com.gnostica.modules.user.service.InstructorApplicationService;' },
    @{ From = 'import com.gnostica.service.impl.InstructorApplicationServiceImpl;'; To = 'import com.gnostica.modules.user.service.impl.InstructorApplicationServiceImpl;' },
    @{ From = 'import com.gnostica.service.InstructorDashboardService;'; To = 'import com.gnostica.modules.user.service.InstructorDashboardService;' },
    @{ From = 'import com.gnostica.service.impl.InstructorDashboardServiceImpl;'; To = 'import com.gnostica.modules.user.service.impl.InstructorDashboardServiceImpl;' },
    @{ From = 'import com.gnostica.service.FollowingService;'; To = 'import com.gnostica.modules.user.service.FollowingService;' },
    @{ From = 'import com.gnostica.service.impl.FollowingServiceImpl;'; To = 'import com.gnostica.modules.user.service.impl.FollowingServiceImpl;' },
    @{ From = 'import com.gnostica.service.FavouriteService;'; To = 'import com.gnostica.modules.user.service.FavouriteService;' },
    @{ From = 'import com.gnostica.service.NotificationService;'; To = 'import com.gnostica.modules.user.service.NotificationService;' },
    
    # Fully Qualified Reference fixes (inline usage)
    @{ From = 'com.gnostica.dto.PersonalizationDTO'; To = 'com.gnostica.modules.user.dto.request.PersonalizationDTO'; FileMatch = 'AccountController\.java|AuthService\.java|AuthServiceImpl\.java' }
)

$totalChanges = 0
foreach ($file in $allJavaFiles) {
    $content = Get-Content $file -Raw
    $originalContent = $content
    
    foreach ($r in $replacements) {
        if ($r.FileMatch) {
            # Apply to specific files
            if ($file -match $r.FileMatch) {
                $content = $content.Replace($r.From, $r.To)
            }
        } else {
            # Apply everywhere
            $content = $content.Replace($r.From, $r.To)
        }
    }
    
    # Fix potential double module packaging
    $content = $content.Replace('com.gnostica.modules.user.modules.user.', 'com.gnostica.modules.user.')

    if ($content -ne $originalContent) {
        Set-Content -Path $file -Value $content -NoNewline
        $totalChanges++
        Write-Output "Updated: $($file.Replace((Get-Location).Path + '\', ''))"
    }
}

Write-Output ""
Write-Output "Total files updated: $totalChanges"
