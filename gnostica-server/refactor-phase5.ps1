$base = "src\main\java\com\gnostica"

# Create directories
$dirs = @(
    "$base\modules\order\controller", "$base\modules\order\dto\request", "$base\modules\order\dto\response", "$base\modules\order\service\impl",
    "$base\modules\payment\controller", "$base\modules\payment\dto\request", "$base\modules\payment\dto\response", "$base\modules\payment\service\impl"
)
foreach ($d in $dirs) { New-Item -ItemType Directory -Path $d -Force | Out-Null }

# Move order files
$orderFiles = @(
    @{ Path = "$base\controller\OrderController.java"; Dest = "$base\modules\order\controller\" },
    @{ Path = "$base\controller\CouponController.java"; Dest = "$base\modules\order\controller\" },
    @{ Path = "$base\dto\request\CouponRequest.java"; Dest = "$base\modules\order\dto\request\" },
    @{ Path = "$base\dto\response\CouponResponse.java"; Dest = "$base\modules\order\dto\response\" },
    @{ Path = "$base\dto\response\RecentOrderDTO.java"; Dest = "$base\modules\order\dto\response\" },
    @{ Path = "$base\service\OrderService.java"; Dest = "$base\modules\order\service\" },
    @{ Path = "$base\service\CouponService.java"; Dest = "$base\modules\order\service\" }
)

# Move payment files
$paymentFiles = @(
    @{ Path = "$base\controller\PaymentController.java"; Dest = "$base\modules\payment\controller\" },
    @{ Path = "$base\dto\request\ConfirmWebhookRequestBody.java"; Dest = "$base\modules\payment\dto\request\" },
    @{ Path = "$base\dto\request\CreatePaymentLinkRequestBody.java"; Dest = "$base\modules\payment\dto\request\" },
    @{ Path = "$base\dto\response\PaymentLinkResponse.java"; Dest = "$base\modules\payment\dto\response\" },
    @{ Path = "$base\service\PaymentService.java"; Dest = "$base\modules\payment\service\" },
    @{ Path = "$base\service\PaymentStrategyService.java"; Dest = "$base\modules\payment\service\" },
    @{ Path = "$base\service\PaymentStrategyFactoryService.java"; Dest = "$base\modules\payment\service\" },
    @{ Path = "$base\service\impl\PaymentServiceImpl.java"; Dest = "$base\modules\payment\service\impl\" },
    @{ Path = "$base\service\impl\PaymentStrategyFactoryImpl.java"; Dest = "$base\modules\payment\service\impl\" },
    @{ Path = "$base\service\impl\PayOSStrategyImpl.java"; Dest = "$base\modules\payment\service\impl\" },
    @{ Path = "$base\service\impl\VNPayStrategyImpl.java"; Dest = "$base\modules\payment\service\impl\" }
)

foreach ($f in $orderFiles + $paymentFiles) {
    if (Test-Path $f.Path) { Move-Item $f.Path $f.Dest -Force }
}

# Update content in all java files
$allJavaFiles = Get-ChildItem -Path $base -Recurse -Filter "*.java" | Select-Object -ExpandProperty FullName

$replacements = @(
    # Fix Packages
    @{ From = 'package com.gnostica.controller;'; To = 'package com.gnostica.modules.order.controller;'; FileMatch = 'OrderController\.java|CouponController\.java' },
    @{ From = 'package com.gnostica.dto.request;'; To = 'package com.gnostica.modules.order.dto.request;'; FileMatch = 'CouponRequest\.java' },
    @{ From = 'package com.gnostica.dto.response;'; To = 'package com.gnostica.modules.order.dto.response;'; FileMatch = 'CouponResponse\.java|RecentOrderDTO\.java' },
    @{ From = 'package com.gnostica.service;'; To = 'package com.gnostica.modules.order.service;'; FileMatch = 'OrderService\.java|CouponService\.java' },

    @{ From = 'package com.gnostica.controller;'; To = 'package com.gnostica.modules.payment.controller;'; FileMatch = 'PaymentController\.java' },
    @{ From = 'package com.gnostica.dto.request;'; To = 'package com.gnostica.modules.payment.dto.request;'; FileMatch = 'ConfirmWebhookRequestBody\.java|CreatePaymentLinkRequestBody\.java' },
    @{ From = 'package com.gnostica.dto.response;'; To = 'package com.gnostica.modules.payment.dto.response;'; FileMatch = 'PaymentLinkResponse\.java' },
    @{ From = 'package com.gnostica.service;'; To = 'package com.gnostica.modules.payment.service;'; FileMatch = 'PaymentService\.java|PaymentStrategyService\.java|PaymentStrategyFactoryService\.java' },
    @{ From = 'package com.gnostica.service.impl;'; To = 'package com.gnostica.modules.payment.service.impl;'; FileMatch = 'PaymentServiceImpl\.java|PaymentStrategyFactoryImpl\.java|PayOSStrategyImpl\.java|VNPayStrategyImpl\.java' },

    # Global Imports - Order
    @{ From = 'import com.gnostica.controller.OrderController;'; To = 'import com.gnostica.modules.order.controller.OrderController;' },
    @{ From = 'import com.gnostica.controller.CouponController;'; To = 'import com.gnostica.modules.order.controller.CouponController;' },
    @{ From = 'import com.gnostica.dto.request.CouponRequest;'; To = 'import com.gnostica.modules.order.dto.request.CouponRequest;' },
    @{ From = 'import com.gnostica.dto.response.CouponResponse;'; To = 'import com.gnostica.modules.order.dto.response.CouponResponse;' },
    @{ From = 'import com.gnostica.dto.response.RecentOrderDTO;'; To = 'import com.gnostica.modules.order.dto.response.RecentOrderDTO;' },
    @{ From = 'import com.gnostica.service.OrderService;'; To = 'import com.gnostica.modules.order.service.OrderService;' },
    @{ From = 'import com.gnostica.service.CouponService;'; To = 'import com.gnostica.modules.order.service.CouponService;' },

    # Global Imports - Payment
    @{ From = 'import com.gnostica.controller.PaymentController;'; To = 'import com.gnostica.modules.payment.controller.PaymentController;' },
    @{ From = 'import com.gnostica.dto.request.ConfirmWebhookRequestBody;'; To = 'import com.gnostica.modules.payment.dto.request.ConfirmWebhookRequestBody;' },
    @{ From = 'import com.gnostica.dto.request.CreatePaymentLinkRequestBody;'; To = 'import com.gnostica.modules.payment.dto.request.CreatePaymentLinkRequestBody;' },
    @{ From = 'import com.gnostica.dto.response.PaymentLinkResponse;'; To = 'import com.gnostica.modules.payment.dto.response.PaymentLinkResponse;' },
    @{ From = 'import com.gnostica.service.PaymentService;'; To = 'import com.gnostica.modules.payment.service.PaymentService;' },
    @{ From = 'import com.gnostica.service.PaymentStrategyService;'; To = 'import com.gnostica.modules.payment.service.PaymentStrategyService;' },
    @{ From = 'import com.gnostica.service.PaymentStrategyFactoryService;'; To = 'import com.gnostica.modules.payment.service.PaymentStrategyFactoryService;' },
    @{ From = 'import com.gnostica.service.impl.PaymentServiceImpl;'; To = 'import com.gnostica.modules.payment.service.impl.PaymentServiceImpl;' },
    @{ From = 'import com.gnostica.service.impl.PaymentStrategyFactoryImpl;'; To = 'import com.gnostica.modules.payment.service.impl.PaymentStrategyFactoryImpl;' },
    @{ From = 'import com.gnostica.service.impl.PayOSStrategyImpl;'; To = 'import com.gnostica.modules.payment.service.impl.PayOSStrategyImpl;' },
    @{ From = 'import com.gnostica.service.impl.VNPayStrategyImpl;'; To = 'import com.gnostica.modules.payment.service.impl.VNPayStrategyImpl;' },
    
    # Missing explicit imports since files were moved out of com.gnostica.service
    @{ From = 'import com.gnostica.dto.response.*;'; To = "import com.gnostica.dto.response.*;`r`nimport com.gnostica.modules.order.dto.response.*;`r`nimport com.gnostica.modules.payment.dto.response.*;" },
    @{ From = 'import com.gnostica.dto.request.*;'; To = "import com.gnostica.dto.request.*;`r`nimport com.gnostica.modules.order.dto.request.*;`r`nimport com.gnostica.modules.payment.dto.request.*;" }
)

$totalChanges = 0
foreach ($file in $allJavaFiles) {
    $content = Get-Content $file -Raw
    $originalContent = $content
    
    foreach ($r in $replacements) {
        if ($r.FileMatch) {
            if ($file -match $r.FileMatch) {
                $content = $content -replace "(?m)^package com\.gnostica\..*?`;", $r.To
                # Since we replaced package, add missing generic cross-service imports if not present
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
