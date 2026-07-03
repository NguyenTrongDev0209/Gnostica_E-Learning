$base = "src\main\java\com\gnostica"
$authDirs = @(
    "$base\modules\auth\controller",
    "$base\modules\auth\dto\request",
    "$base\modules\auth\dto\response",
    "$base\modules\auth\service\impl"
)

# Create directories
foreach ($d in $authDirs) {
    New-Item -ItemType Directory -Path $d -Force | Out-Null
}

# Move files
$filesToMove = @(
    @{ Path = "$base\controller\AuthController.java"; Dest = "$base\modules\auth\controller\" },
    @{ Path = "$base\controller\AccountController.java"; Dest = "$base\modules\auth\controller\" },
    @{ Path = "$base\dto\request\LoginRequest.java"; Dest = "$base\modules\auth\dto\request\" },
    @{ Path = "$base\dto\request\RegisterRequest.java"; Dest = "$base\modules\auth\dto\request\" },
    @{ Path = "$base\dto\request\ResetPasswordRequest.java"; Dest = "$base\modules\auth\dto\request\" },
    @{ Path = "$base\dto\response\LoginResponse.java"; Dest = "$base\modules\auth\dto\response\" },
    @{ Path = "$base\service\AuthService.java"; Dest = "$base\modules\auth\service\" },
    @{ Path = "$base\service\impl\AuthServiceImpl.java"; Dest = "$base\modules\auth\service\impl\" }
)

foreach ($f in $filesToMove) {
    if (Test-Path $f.Path) {
        Move-Item $f.Path $f.Dest -Force
    }
}

# Update content in all java files
$allJavaFiles = Get-ChildItem -Path $base -Recurse -Filter "*.java" | Select-Object -ExpandProperty FullName

$replacements = @(
    # Package declarations for moved files (exact matches to avoid false positives)
    @{ From = 'package com.gnostica.controller;'; To = 'package com.gnostica.modules.auth.controller;'; FileMatch = 'AuthController\.java|AccountController\.java' },
    @{ From = 'package com.gnostica.dto.request;'; To = 'package com.gnostica.modules.auth.dto.request;'; FileMatch = 'LoginRequest\.java|RegisterRequest\.java|ResetPasswordRequest\.java' },
    @{ From = 'package com.gnostica.dto.response;'; To = 'package com.gnostica.modules.auth.dto.response;'; FileMatch = 'LoginResponse\.java' },
    @{ From = 'package com.gnostica.service;'; To = 'package com.gnostica.modules.auth.service;'; FileMatch = 'AuthService\.java' },
    @{ From = 'package com.gnostica.service.impl;'; To = 'package com.gnostica.modules.auth.service.impl;'; FileMatch = 'AuthServiceImpl\.java' },

    # Imports across the project
    @{ From = 'import com.gnostica.controller.AuthController;'; To = 'import com.gnostica.modules.auth.controller.AuthController;' },
    @{ From = 'import com.gnostica.controller.AccountController;'; To = 'import com.gnostica.modules.auth.controller.AccountController;' },
    @{ From = 'import com.gnostica.dto.request.LoginRequest;'; To = 'import com.gnostica.modules.auth.dto.request.LoginRequest;' },
    @{ From = 'import com.gnostica.dto.request.RegisterRequest;'; To = 'import com.gnostica.modules.auth.dto.request.RegisterRequest;' },
    @{ From = 'import com.gnostica.dto.request.ResetPasswordRequest;'; To = 'import com.gnostica.modules.auth.dto.request.ResetPasswordRequest;' },
    @{ From = 'import com.gnostica.dto.response.LoginResponse;'; To = 'import com.gnostica.modules.auth.dto.response.LoginResponse;' },
    @{ From = 'import com.gnostica.service.AuthService;'; To = 'import com.gnostica.modules.auth.service.AuthService;' },
    @{ From = 'import com.gnostica.service.impl.AuthServiceImpl;'; To = 'import com.gnostica.modules.auth.service.impl.AuthServiceImpl;' },
    
    # Inline FQ references just in case
    @{ From = 'com.gnostica.service.AuthService'; To = 'com.gnostica.modules.auth.service.AuthService' }
)

$totalChanges = 0
foreach ($file in $allJavaFiles) {
    $content = Get-Content $file -Raw
    $originalContent = $content
    
    foreach ($r in $replacements) {
        if ($r.FileMatch) {
            # Only apply package replacements to the specific moved files
            if ($file -match $r.FileMatch) {
                $content = $content.Replace($r.From, $r.To)
            }
        } else {
            # Imports apply everywhere
            $content = $content.Replace($r.From, $r.To)
        }
    }
    
    # Fix double replacements if any
    $content = $content.Replace('com.gnostica.modules.auth.modules.auth.', 'com.gnostica.modules.auth.')

    if ($content -ne $originalContent) {
        Set-Content -Path $file -Value $content -NoNewline
        $totalChanges++
        Write-Output "Updated: $($file.Replace((Get-Location).Path + '\', ''))"
    }
}

Write-Output ""
Write-Output "Total files updated: $totalChanges"
