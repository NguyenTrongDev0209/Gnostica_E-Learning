$base = "src\main\java\com\gnostica"

# Create directories
$dirs = @(
    "$base\modules\integration\controller",
    "$base\modules\integration\dto\request",
    "$base\modules\integration\dto\response",
    "$base\modules\integration\service\impl",
    "$base\modules\wallet\dto\request"
)
foreach ($d in $dirs) { New-Item -ItemType Directory -Path $d -Force | Out-Null }

# Move leftover Wallet files
$leftovers = @(
    @{ Path = "$base\dto\SetBankAccountRequest.java"; Dest = "$base\modules\wallet\dto\request\" },
    @{ Path = "$base\dto\WithdrawRequest.java"; Dest = "$base\modules\wallet\dto\request\" }
)

# Move Integration files
$integrationFiles = @(
    @{ Path = "$base\controller\AiController.java"; Dest = "$base\modules\integration\controller\" },
    @{ Path = "$base\controller\UploadController.java"; Dest = "$base\modules\integration\controller\" },
    @{ Path = "$base\dto\request\AiChatRequest.java"; Dest = "$base\modules\integration\dto\request\" },
    @{ Path = "$base\dto\response\AiChatResponse.java"; Dest = "$base\modules\integration\dto\response\" },
    @{ Path = "$base\service\AiModerationService.java"; Dest = "$base\modules\integration\service\" },
    @{ Path = "$base\service\AiService.java"; Dest = "$base\modules\integration\service\" },
    @{ Path = "$base\service\BunnyNetService.java"; Dest = "$base\modules\integration\service\" },
    @{ Path = "$base\service\BunnyStorageService.java"; Dest = "$base\modules\integration\service\" },
    @{ Path = "$base\service\BunnyTranscriptionService.java"; Dest = "$base\modules\integration\service\" },
    @{ Path = "$base\service\CloudinaryService.java"; Dest = "$base\modules\integration\service\" },
    @{ Path = "$base\service\DocumentExtractionService.java"; Dest = "$base\modules\integration\service\" },
    @{ Path = "$base\service\MailService.java"; Dest = "$base\modules\integration\service\" },
    @{ Path = "$base\service\MetricsPublisher.java"; Dest = "$base\modules\integration\service\" },
    @{ Path = "$base\service\OpenRouterAiService.java"; Dest = "$base\modules\integration\service\" }
)

foreach ($f in $leftovers + $integrationFiles) {
    if (Test-Path $f.Path) { Move-Item $f.Path $f.Dest -Force }
}

# Update packages and imports in java files
$allJavaFiles = Get-ChildItem -Path $base -Recurse -Filter "*.java" | Select-Object -ExpandProperty FullName

$replacements = @(
    # Leftovers
    @{ From = 'package com.gnostica.dto;'; To = 'package com.gnostica.modules.wallet.dto.request;'; FileMatch = 'SetBankAccountRequest\.java|WithdrawRequest\.java' },
    
    # Integration
    @{ From = 'package com.gnostica.controller;'; To = 'package com.gnostica.modules.integration.controller;'; FileMatch = 'AiController\.java|UploadController\.java' },
    @{ From = 'package com.gnostica.dto.request;'; To = 'package com.gnostica.modules.integration.dto.request;'; FileMatch = 'AiChatRequest\.java' },
    @{ From = 'package com.gnostica.dto.response;'; To = 'package com.gnostica.modules.integration.dto.response;'; FileMatch = 'AiChatResponse\.java' },
    @{ From = 'package com.gnostica.service;'; To = 'package com.gnostica.modules.integration.service;'; FileMatch = 'AiModerationService\.java|AiService\.java|BunnyNetService\.java|BunnyStorageService\.java|BunnyTranscriptionService\.java|CloudinaryService\.java|DocumentExtractionService\.java|MailService\.java|MetricsPublisher\.java|OpenRouterAiService\.java' },

    # Explicit cross-module imports
    @{ From = 'import com.gnostica.dto.WithdrawRequest;'; To = 'import com.gnostica.modules.wallet.dto.request.WithdrawRequest;' },
    @{ From = 'import com.gnostica.dto.SetBankAccountRequest;'; To = 'import com.gnostica.modules.wallet.dto.request.SetBankAccountRequest;' },
    @{ From = 'import com.gnostica.dto.request.AiChatRequest;'; To = 'import com.gnostica.modules.integration.dto.request.AiChatRequest;' },
    @{ From = 'import com.gnostica.dto.response.AiChatResponse;'; To = 'import com.gnostica.modules.integration.dto.response.AiChatResponse;' },
    @{ From = 'import com.gnostica.service.AiService;'; To = 'import com.gnostica.modules.integration.service.AiService;' },
    @{ From = 'import com.gnostica.service.AiModerationService;'; To = 'import com.gnostica.modules.integration.service.AiModerationService;' },
    @{ From = 'import com.gnostica.service.BunnyNetService;'; To = 'import com.gnostica.modules.integration.service.BunnyNetService;' },
    @{ From = 'import com.gnostica.service.BunnyStorageService;'; To = 'import com.gnostica.modules.integration.service.BunnyStorageService;' },
    @{ From = 'import com.gnostica.service.BunnyTranscriptionService;'; To = 'import com.gnostica.modules.integration.service.BunnyTranscriptionService;' },
    @{ From = 'import com.gnostica.service.CloudinaryService;'; To = 'import com.gnostica.modules.integration.service.CloudinaryService;' },
    @{ From = 'import com.gnostica.service.DocumentExtractionService;'; To = 'import com.gnostica.modules.integration.service.DocumentExtractionService;' },
    @{ From = 'import com.gnostica.service.MailService;'; To = 'import com.gnostica.modules.integration.service.MailService;' },
    @{ From = 'import com.gnostica.service.MetricsPublisher;'; To = 'import com.gnostica.modules.integration.service.MetricsPublisher;' },
    @{ From = 'import com.gnostica.service.OpenRouterAiService;'; To = 'import com.gnostica.modules.integration.service.OpenRouterAiService;' }
)

$totalChanges = 0
foreach ($file in $allJavaFiles) {
    $content = Get-Content $file -Raw
    $originalContent = $content
    
    foreach ($r in $replacements) {
        if ($r.FileMatch) {
            if ($file -match $r.FileMatch) {
                $content = $content -replace "(?m)^package (.*?);", $r.To
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
