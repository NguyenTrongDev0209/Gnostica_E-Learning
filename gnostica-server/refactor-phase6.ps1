$base = "src\main\java\com\gnostica"

# Create directories
$dirs = @(
    "$base\modules\forum\controller", "$base\modules\forum\dto\request", "$base\modules\forum\dto\response", "$base\modules\forum\service\impl",
    "$base\modules\wallet\controller", "$base\modules\wallet\dto\request", "$base\modules\wallet\dto\response", "$base\modules\wallet\service\impl",
    "$base\modules\dashboard\controller", "$base\modules\dashboard\dto\request", "$base\modules\dashboard\dto\response", "$base\modules\dashboard\service\impl"
)
foreach ($d in $dirs) { New-Item -ItemType Directory -Path $d -Force | Out-Null }

# Move forum files
$forumFiles = @(
    @{ Path = "$base\controller\ForumCategoryController.java"; Dest = "$base\modules\forum\controller\" },
    @{ Path = "$base\controller\ThreadController.java"; Dest = "$base\modules\forum\controller\" },
    @{ Path = "$base\controller\CommentController.java"; Dest = "$base\modules\forum\controller\" },
    @{ Path = "$base\controller\ThreadReportController.java"; Dest = "$base\modules\forum\controller\" },
    @{ Path = "$base\dto\request\ThreadReportRequest.java"; Dest = "$base\modules\forum\dto\request\" },
    @{ Path = "$base\dto\response\ThreadReportResponse.java"; Dest = "$base\modules\forum\dto\response\" },
    @{ Path = "$base\service\ThreadService.java"; Dest = "$base\modules\forum\service\" },
    @{ Path = "$base\service\CommentService.java"; Dest = "$base\modules\forum\service\" },
    @{ Path = "$base\service\ThreadReportService.java"; Dest = "$base\modules\forum\service\" },
    @{ Path = "$base\service\impl\ThreadServiceImpl.java"; Dest = "$base\modules\forum\service\impl\" },
    @{ Path = "$base\service\impl\CommentServiceImpl.java"; Dest = "$base\modules\forum\service\impl\" },
    @{ Path = "$base\service\impl\ThreadReportServiceImpl.java"; Dest = "$base\modules\forum\service\impl\" }
)

# Move wallet files
$walletFiles = @(
    @{ Path = "$base\controller\WalletController.java"; Dest = "$base\modules\wallet\controller\" },
    @{ Path = "$base\controller\PayoutsController.java"; Dest = "$base\modules\wallet\controller\" },
    @{ Path = "$base\controller\TransactionController.java"; Dest = "$base\modules\wallet\controller\" },
    @{ Path = "$base\controller\BankController.java"; Dest = "$base\modules\wallet\controller\" },
    @{ Path = "$base\dto\response\VietQrBankDto.java"; Dest = "$base\modules\wallet\dto\response\" },
    @{ Path = "$base\dto\response\VietQrResponse.java"; Dest = "$base\modules\wallet\dto\response\" },
    @{ Path = "$base\service\WalletService.java"; Dest = "$base\modules\wallet\service\" },
    @{ Path = "$base\service\PayoutsService.java"; Dest = "$base\modules\wallet\service\" },
    @{ Path = "$base\service\TransactionService.java"; Dest = "$base\modules\wallet\service\" },
    @{ Path = "$base\service\BankService.java"; Dest = "$base\modules\wallet\service\" },
    @{ Path = "$base\service\BankSyncService.java"; Dest = "$base\modules\wallet\service\" }
)

# Move dashboard files
$dashboardFiles = @(
    @{ Path = "$base\controller\DashboardController.java"; Dest = "$base\modules\dashboard\controller\" },
    @{ Path = "$base\dto\response\ChartDataDTO.java"; Dest = "$base\modules\dashboard\dto\response\" },
    @{ Path = "$base\dto\response\CoursePerformanceDTO.java"; Dest = "$base\modules\dashboard\dto\response\" },
    @{ Path = "$base\dto\response\DashboardStatsResponse.java"; Dest = "$base\modules\dashboard\dto\response\" },
    @{ Path = "$base\dto\response\MemberGrowthDTO.java"; Dest = "$base\modules\dashboard\dto\response\" },
    @{ Path = "$base\dto\response\RatingDistributionDTO.java"; Dest = "$base\modules\dashboard\dto\response\" },
    @{ Path = "$base\dto\response\RevenueMonthDTO.java"; Dest = "$base\modules\dashboard\dto\response\" },
    @{ Path = "$base\dto\response\TopCourseDTO.java"; Dest = "$base\modules\dashboard\dto\response\" },
    @{ Path = "$base\service\DashboardService.java"; Dest = "$base\modules\dashboard\service\" },
    @{ Path = "$base\service\impl\DashboardServiceImpl.java"; Dest = "$base\modules\dashboard\service\impl\" }
)

foreach ($f in $forumFiles + $walletFiles + $dashboardFiles) {
    if (Test-Path $f.Path) { Move-Item $f.Path $f.Dest -Force }
}

# Update content in all java files
$allJavaFiles = Get-ChildItem -Path $base -Recurse -Filter "*.java" | Select-Object -ExpandProperty FullName

$replacements = @(
    # Forum
    @{ From = 'package com.gnostica.controller;'; To = 'package com.gnostica.modules.forum.controller;'; FileMatch = 'ForumCategoryController\.java|ThreadController\.java|CommentController\.java|ThreadReportController\.java' },
    @{ From = 'package com.gnostica.dto.request;'; To = 'package com.gnostica.modules.forum.dto.request;'; FileMatch = 'ThreadReportRequest\.java' },
    @{ From = 'package com.gnostica.dto.response;'; To = 'package com.gnostica.modules.forum.dto.response;'; FileMatch = 'ThreadReportResponse\.java' },
    @{ From = 'package com.gnostica.service;'; To = 'package com.gnostica.modules.forum.service;'; FileMatch = 'ThreadService\.java|CommentService\.java|ThreadReportService\.java' },
    @{ From = 'package com.gnostica.service.impl;'; To = 'package com.gnostica.modules.forum.service.impl;'; FileMatch = 'ThreadServiceImpl\.java|CommentServiceImpl\.java|ThreadReportServiceImpl\.java' },

    # Wallet
    @{ From = 'package com.gnostica.controller;'; To = 'package com.gnostica.modules.wallet.controller;'; FileMatch = 'WalletController\.java|PayoutsController\.java|TransactionController\.java|BankController\.java' },
    @{ From = 'package com.gnostica.dto.response;'; To = 'package com.gnostica.modules.wallet.dto.response;'; FileMatch = 'VietQrBankDto\.java|VietQrResponse\.java' },
    @{ From = 'package com.gnostica.service;'; To = 'package com.gnostica.modules.wallet.service;'; FileMatch = 'WalletService\.java|PayoutsService\.java|TransactionService\.java|BankService\.java|BankSyncService\.java' },

    # Dashboard
    @{ From = 'package com.gnostica.controller;'; To = 'package com.gnostica.modules.dashboard.controller;'; FileMatch = 'DashboardController\.java' },
    @{ From = 'package com.gnostica.dto.response;'; To = 'package com.gnostica.modules.dashboard.dto.response;'; FileMatch = 'ChartDataDTO\.java|CoursePerformanceDTO\.java|DashboardStatsResponse\.java|MemberGrowthDTO\.java|RatingDistributionDTO\.java|RevenueMonthDTO\.java|TopCourseDTO\.java' },
    @{ From = 'package com.gnostica.service;'; To = 'package com.gnostica.modules.dashboard.service;'; FileMatch = 'DashboardService\.java' },
    @{ From = 'package com.gnostica.service.impl;'; To = 'package com.gnostica.modules.dashboard.service.impl;'; FileMatch = 'DashboardServiceImpl\.java' },

    # Global Imports
    @{ From = 'import com.gnostica.dto.request.*;'; To = "import com.gnostica.dto.request.*;`r`nimport com.gnostica.modules.forum.dto.request.*;" },
    @{ From = 'import com.gnostica.dto.response.*;'; To = "import com.gnostica.dto.response.*;`r`nimport com.gnostica.modules.forum.dto.response.*;`r`nimport com.gnostica.modules.wallet.dto.response.*;`r`nimport com.gnostica.modules.dashboard.dto.response.*;" }
)

$totalChanges = 0
foreach ($file in $allJavaFiles) {
    $content = Get-Content $file -Raw
    $originalContent = $content
    
    foreach ($r in $replacements) {
        if ($r.FileMatch) {
            if ($file -match $r.FileMatch) {
                $content = $content -replace "(?m)^package com\.gnostica\..*?`;", $r.To
                if ($content -notmatch "import com\.gnostica\.service\.\*;") {
                    $content = $content -replace "(?m)^package (.*?);", "`$0`r`nimport com.gnostica.service.*;"
                }
            }
        } else {
            $content = $content.Replace($r.From, $r.To)
        }
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file -Value $content -NoNewline
        $totalChanges++
        Write-Output "Updated: $($file.Replace((Get-Location).Path + '\', ''))"
    }
}
Write-Output ""
Write-Output "Total files updated: $totalChanges"
