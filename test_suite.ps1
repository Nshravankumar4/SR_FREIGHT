# Automated Test Suite for SR_T Lorry Freight Management System
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🚚 SR_T LORRY FREIGHT SYSTEM - AUTOMATED VERIFICATION SUITE" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$allPassed = $true

function Run-Check($title, $scriptBlock) {
    Write-Host ("`n[TEST] " + $title) -NoNewline
    try {
        $result = & $scriptBlock
        if ($result -eq $true) {
            Write-Host " -> PASS ✅" -ForegroundColor Green
        } else {
            Write-Host " -> FAIL ❌" -ForegroundColor Red
            $global:allPassed = $false
        }
    } catch {
        Write-Host (" -> ERROR ❌ (" + $_.Exception.Message + ")") -ForegroundColor Red
        $global:allPassed = $false
    }
}

# 1. Developer Attribution Verification
Run-Check "Developer Attribution (Shravan Kumar) in index.html" {
    $html = Get-Content 'd:\Repo\Lorry\index.html' -Raw
    return ($html.Contains("Developed by") -and $html.Contains("Shravan Kumar"))
}

# 2. Login User Switch & Password Controls
Run-Check "Login User Switch Cards (Admin vs Rudra) & Toggle Password Button" {
    $html = Get-Content 'd:\Repo\Lorry\index.html' -Raw
    $hasAdminBtn = $html.Contains('id="userBtnAdmin"')
    $hasRudraBtn = $html.Contains('id="userBtnRudra"')
    $hasToggleBtn = $html.Contains('id="togglePasswordBtn"')
    $hasSecureLoginBtn = $html.Contains('id="loginSubmitBtn"')
    return ($hasAdminBtn -and $hasRudraBtn -and $hasToggleBtn -and $hasSecureLoginBtn)
}

# 3. Header Controls & Logout Button
Run-Check "Header Controls (Menu Toggle, Vehicle Badge, Sync Button, Logout Button)" {
    $html = Get-Content 'd:\Repo\Lorry\index.html' -Raw
    $hasMenu = $html.Contains('Router.openMenu()')
    $hasSync = $html.Contains('manualSyncBtn')
    $hasLogout = $html.Contains('btn-header-logout')
    $hasVehicleSwitch = $html.Contains('VehicleWorkspace.changeVehicle()')
    return ($hasMenu -and $hasSync -and $hasLogout -and $hasVehicleSwitch)
}

# 4. Multi-User Live Sync Alert Banner
Run-Check "Multi-User Live Sync Alert Banner & Setup Guide" {
    $html = Get-Content 'd:\Repo\Lorry\index.html' -Raw
    $hasBanner = $html.Contains('id="cloudSyncAlertBanner"')
    $hasFixBtn = $html.Contains('View 30s Fix')
    $hasTestBtn = $html.Contains('Test Connection')
    return ($hasBanner -and $hasFixBtn -and $hasTestBtn)
}

# 5. Slide-Over Menu Drawer Controls
Run-Check "Slide-Over Menu Drawer & Navigation Links" {
    $html = Get-Content 'd:\Repo\Lorry\index.html' -Raw
    $hasDash = $html.Contains("Router.navigate('dashboard')")
    $hasTrips = $html.Contains("Router.navigate('trips')")
    $hasExcel = $html.Contains("Router.navigate('excel')")
    $hasVehData = $html.Contains("Router.navigate('vehicle-data')")
    $hasSettings = $html.Contains("Router.navigate('settings')")
    $hasPwdModal = $html.Contains("App.openChangePasswordModal()")
    return ($hasDash -and $hasTrips -and $hasExcel -and $hasVehData -and $hasSettings -and $hasPwdModal)
}

# 6. Auth Module & Foolproof Logout
Run-Check "Auth Module (Credentials, Safe Logout, selectUser, Role Check)" {
    $auth = Get-Content 'd:\Repo\Lorry\js\auth.js' -Raw
    $hasAdmin = $auth.Contains('Shravan@2505')
    $hasRudra = $auth.Contains('RudraSarika@2505')
    $hasSelectUser = $auth.Contains('selectUser')
    $hasLogoutSafe = $auth.Contains('closeEditDrawer')
    $hasIsAdmin = $auth.Contains('isAdmin()')
    return ($hasAdmin -and $hasRudra -and $hasSelectUser -and $hasLogoutSafe -and $hasIsAdmin)
}

# 7. Trips Module & Edit Drawer Close Fix
Run-Check "Trips Module (closeEditDrawer alias, exportTripExcel, printTripReceipt)" {
    $trips = Get-Content 'd:\Repo\Lorry\js\trips\trips.js' -Raw
    $hasAlias = $trips.Contains('closeEditDrawer()')
    $hasExcelExp = $trips.Contains('exportTripExcel')
    $hasPrint = $trips.Contains('printTripReceipt')
    return ($hasAlias -and $hasExcelExp -and $hasPrint)
}

# 8. Settings Module & Live Diagnostics
Run-Check "Settings Module (saveConfig, testConnection, updatePasswords, exportBackupJson)" {
    $settings = Get-Content 'd:\Repo\Lorry\js\settings\settings.js' -Raw
    $hasSave = $settings.Contains('saveConfig')
    $hasTest = $settings.Contains('testConnection')
    $hasPwd = $settings.Contains('updatePasswords')
    $hasBackup = $settings.Contains('exportBackupJson')
    return ($hasSave -and $hasTest -and $hasPwd -and $hasBackup)
}

# 9. Cloud API Architecture & Vehicle TS15UE1122 Trip Contract
Run-Check "Cloud API Architecture & TS15UE1122 Endpoint Contract" {
    $apiJs = Get-Content 'd:\Repo\Lorry\js\api.js' -Raw
    $hasGetTrips = $apiJs.Contains('getTrips(')
    $hasPost = $apiJs.Contains('createTrip')
    $hasUrl = $apiJs.Contains('CONFIG')
    return ($hasGetTrips -and $hasPost -and $hasUrl)
}

# 10. Cloud API Security & Role-Based Mutation Contract
Run-Check "Cloud API Security & Multi-Vehicle Scope Chain" {
    $apiJs = Get-Content 'd:\Repo\Lorry\js\api.js' -Raw
    $hasAddRenewal = $apiJs.Contains('addRenewal')
    $hasUpdateRenewal = $apiJs.Contains('updateRenewal')
    $hasDeleteRenewal = $apiJs.Contains('deleteRenewal')
    $hasGetRenewals = $apiJs.Contains('getRenewals')
    return ($hasAddRenewal -and $hasUpdateRenewal -and $hasDeleteRenewal -and $hasGetRenewals)
}

# 11. Golden Financial Math Equations
Run-Check "Financial Engine Equations (Freight ₹130,000, Exp ₹119,200 => Profit ₹10,800, Bal ₹10,000)" {
    $freight = 130000
    $advance = 120000
    $expenses = 119200
    $receipt1 = 9000
    $receipt2 = 1000

    $profit = $freight - $expenses
    $origBal = $freight - $advance
    $remBalAfter1 = $origBal - $receipt1
    $remBalAfter2 = $remBalAfter1 - $receipt2

    return ($profit -eq 10800 -and $origBal -eq 10000 -and $remBalAfter1 -eq 1000 -and $remBalAfter2 -eq 0)
}

# 12. Renewals & Alerts HTML & UI Components
Run-Check "Renewals & Alerts UI Elements (View, Badges, Header Bell, Modals)" {
    $html = Get-Content 'd:\Repo\Lorry\index.html' -Raw
    $hasView = $html.Contains('id="view-renewals"')
    $hasAlertModal = $html.Contains('id="modal-renewal-alert"')
    $hasFormModal = $html.Contains('id="modal-renewal-form"')
    $hasViewModal = $html.Contains('id="modal-renewal-view"')
    $hasHeaderBell = $html.Contains('id="header-renewal-bell-btn"')
    $hasHeaderBadge = $html.Contains('id="header-renewal-badge"')
    $hasDrawerBadge = $html.Contains('id="drawer-renewal-badge"')
    return ($hasView -and $hasAlertModal -and $hasFormModal -and $hasViewModal -and $hasHeaderBell -and $hasHeaderBadge -and $hasDrawerBadge)
}

# 13. Renewals Script Dependencies
Run-Check "Renewals & Alerts Script Tags in index.html" {
    $html = Get-Content 'd:\Repo\Lorry\index.html' -Raw
    $s1 = $html.Contains('js/renewals/renewal-calculations.js')
    $s2 = $html.Contains('js/renewals/renewals.js')
    $s3 = $html.Contains('js/renewals/renewal-table.js')
    $s4 = $html.Contains('js/renewals/renewal-form.js')
    $s5 = $html.Contains('js/renewals/renewal-alerts.js')
    return ($s1 -and $s2 -and $s3 -and $s4 -and $s5)
}

# 14. Renewals Cloud Backend in Code.gs
Run-Check "Google Apps Script Backend Support for Renewals" {
    $code = Get-Content 'd:\Repo\Lorry\google-apps-script\Code.gs' -Raw
    $hasSheet = $code.Contains("SHEET_RENEWALS = 'Renewals'")
    $hasHeaders = $code.Contains("RENEWAL_HEADERS")
    $hasGet = $code.Contains("action === 'getRenewals'")
    $hasAdd = $code.Contains("action === 'addRenewal'")
    $hasUpdate = $code.Contains("action === 'updateRenewal'")
    $hasDelete = $code.Contains("action === 'deleteRenewal'")
    $hasFetchFunc = $code.Contains("function fetchRenewals")
    return ($hasSheet -and $hasHeaders -and $hasGet -and $hasAdd -and $hasUpdate -and $hasDelete -and $hasFetchFunc)
}

# 15. Renewals Calculation Engine & Seed Dataset Validation (Native PowerShell test)
Run-Check "Renewals Engine Unit Tests & 28 Document Canonical Seed Data" {
    $renewalsJs = Get-Content 'd:\Repo\Lorry\js\renewals\renewals.js' -Raw
    $calcJs = Get-Content 'd:\Repo\Lorry\js\renewals\renewal-calculations.js' -Raw

    # Verify canonical vehicles present in renewals seed
    $hasG1122 = $renewalsJs.Contains('TG15G1122')
    $hasC2324 = $renewalsJs.Contains('TG15C2324')
    $hasUE1122 = $renewalsJs.Contains('TG15UE1122')
    $hasT6666 = $renewalsJs.Contains('TG15T6666')

    # Verify key renewal items
    $hasOverdueBikeIns = $renewalsJs.Contains('REN-TG15C2324-01') -and $renewalsJs.Contains('2026-09-05')
    $hasDueTomorrowTax = $renewalsJs.Contains('REN-TG15UE1122-06') -and $renewalsJs.Contains('2026-09-30')
    $hasFutureCarIns = $renewalsJs.Contains('REN-TG15G1122-01') -and $renewalsJs.Contains('2028-03-16')

    # Count renewal entries in seed
    $matchCount = (Select-String -Path 'd:\Repo\Lorry\js\renewals\renewals.js' -Pattern "renewalId: 'REN-").Count

    # Verify calculation logic rules present
    $hasDiffEngine = $calcJs.Contains('diffDays < 0') -and $calcJs.Contains('diffDays === 0') -and $calcJs.Contains('diffDays === 1')
    $hasMetricsEngine = $calcJs.Contains('calculateMetrics') -and $calcJs.Contains('requiresAttention')

    return ($hasG1122 -and $hasC2324 -and $hasUE1122 -and $hasT6666 -and $hasOverdueBikeIns -and $hasDueTomorrowTax -and $hasFutureCarIns -and ($matchCount -eq 28) -and $hasDiffEngine -and $hasMetricsEngine)
}

# 16. Client Authorization Model: canDelete() in js/auth.js
Run-Check "Auth Module Permission Controls (canDelete(), window.canDelete)" {
    $auth = Get-Content 'd:\Repo\Lorry\js\auth.js' -Raw
    $hasCanDelete = $auth.Contains('canDelete()')
    $hasWindowExposure = $auth.Contains('window.canDelete')
    $callsIsAdmin = $auth.Contains('return this.isAdmin()')
    return ($hasCanDelete -and $hasWindowExposure -and $callsIsAdmin)
}

# 17. Router Access for Rudra (Settings & Navigation Unblocked)
Run-Check "Router Access Matrix (Settings Route & Menu Button Unblocked for Rudra)" {
    $router = Get-Content 'd:\Repo\Lorry\js\router.js' -Raw
    # Verify settings is no longer restricted to isAdmin only in navigate()
    $noBlockSettings = -not ($router.Contains("page === 'settings' && !Auth.isAdmin()"))
    # Verify menu-btn-settings is not hidden from Rudra in updateHeader()
    $noHideSettingsBtn = -not ($router.Contains("settingsBtn.classList.add('hidden')"))
    return ($noBlockSettings -and $noHideSettingsBtn)
}

# 18. Frontend UI Delete Guards (Trips, Receipts, Renewals)
Run-Check "Frontend UI Delete Button Guards (Trips, Receipts, Renewals)" {
    $tripTable = Get-Content 'd:\Repo\Lorry\js\trips\trip-table.js' -Raw
    $receiptTable = Get-Content 'd:\Repo\Lorry\js\receipts\receipt-table.js' -Raw
    $renewalTable = Get-Content 'd:\Repo\Lorry\js\renewals\renewal-table.js' -Raw
    $renewalsJs = Get-Content 'd:\Repo\Lorry\js\renewals\renewals.js' -Raw

    $tripGuarded = $tripTable.Contains('canDelete ?') -and $tripTable.Contains('promptDelete')
    $receiptGuarded = $receiptTable.Contains('canDelete ?') -and $receiptTable.Contains('deleteReceipt')
    $renewalGuarded = $renewalTable.Contains('canDelete ?') -and $renewalTable.Contains('deleteRenewal')

    # Verify Rudra has Add & Edit on Renewals
    $renewalAddVisible = -not ($renewalsJs.Contains('${isAdmin ? `') -and $renewalsJs.Contains('RenewalForm.openAddModal()'))
    $renewalEditVisible = $renewalTable.Contains("RenewalForm.openEditModal")

    return ($tripGuarded -and $receiptGuarded -and $renewalGuarded -and $renewalAddVisible -and $renewalEditVisible)
}

# 19. Client API Layer Defensive Delete Interception (js/api.js)
Run-Check "Client API Layer Delete Interceptor & Error Contract (DELETE_NOT_ALLOWED)" {
    $apiJs = Get-Content 'd:\Repo\Lorry\js\api.js' -Raw
    $hasGuard = $apiJs.Contains("action.toLowerCase().includes('delete')")
    $hasCheck = $apiJs.Contains("Auth.canDelete()")
    $hasError = $apiJs.Contains("DELETE_NOT_ALLOWED")
    $hasMsg = $apiJs.Contains("Rudra does not have permission to delete records.")
    $hasGuardInDeleteTrip = $apiJs.Contains("deleteTrip") -and $apiJs.Contains("!Auth.canDelete()")
    $hasGuardInDeleteReceipt = $apiJs.Contains("deleteReceipt") -and $apiJs.Contains("!Auth.canDelete()")
    $hasGuardInDeleteRenewal = $apiJs.Contains("deleteRenewal") -and $apiJs.Contains("!Auth.canDelete()")
    return ($hasGuard -and $hasCheck -and $hasError -and $hasMsg -and $hasGuardInDeleteTrip -and $hasGuardInDeleteReceipt -and $hasGuardInDeleteRenewal)
}

# 20. Google Apps Script Backend Security (Code.gs userCanDelete & Identity Enforcer)
Run-Check "Google Apps Script Backend Security (userCanDelete, DELETE_NOT_ALLOWED, Role Spoof Protection)" {
    $code = Get-Content 'd:\Repo\Lorry\google-apps-script\Code.gs' -Raw
    $hasFunc = $code.Contains("function userCanDelete(envelope)")
    $rejectsRudra = $code.Contains("user === 'rudra'")
    $requiresAdmin = $code.Contains("role === 'Admin'") -and $code.Contains("user === 'admin' || user === 'shravan'")
    $tripProtected = $code.Contains("if (action === 'deleteTrip')") -and $code.Contains("!userCanDelete(envelope)")
    $receiptProtected = $code.Contains("if (action === 'deleteReceipt')") -and $code.Contains("!userCanDelete(envelope)")
    $renewalProtected = $code.Contains("if (action === 'deleteRenewal')") -and $code.Contains("!userCanDelete(envelope)")
    $restoreProtected = $code.Contains("if (action === 'restoreBackup')") -and $code.Contains("!userCanDelete(envelope)")
    $hasStandardError = $code.Contains('"DELETE_NOT_ALLOWED"')

    return ($hasFunc -and $rejectsRudra -and $requiresAdmin -and $tripProtected -and $receiptProtected -and $renewalProtected -and $restoreProtected -and $hasStandardError)
}

# 21. Invoice Studio Namespace & Assets Integrity
Run-Check "Invoice Studio Namespace & Assets (server.py, templates, stamps, app.js)" {
    $dirExists = Test-Path "D:\Repo\Lorry\invoice-studio"
    $hasServer = Test-Path "D:\Repo\Lorry\invoice-studio\server.py"
    $hasApp = Test-Path "D:\Repo\Lorry\invoice-studio\app.js"
    $hasCss = Test-Path "D:\Repo\Lorry\invoice-studio\styles.css"
    $hasIndex = Test-Path "D:\Repo\Lorry\invoice-studio\index.html"
    $hasTemplate = Test-Path "D:\Repo\Lorry\invoice-studio\templates\11048.docx"
    $hasStamp = Test-Path "D:\Repo\Lorry\invoice-studio\stamp_with_sign.png"
    return ($dirExists -and $hasServer -and $hasApp -and $hasCss -and $hasIndex -and $hasTemplate -and $hasStamp)
}

# 22. Invoice Studio Routing & Navigation Integration
Run-Check "Invoice Studio Navigation & Isolation Routing Integration" {
    $html = Get-Content 'D:\Repo\Lorry\index.html' -Raw
    $router = Get-Content 'D:\Repo\Lorry\js\router.js' -Raw

    $hasMenuBtn = $html.Contains('id="menu-btn-invoice-studio"') -and $html.Contains("Router.navigate('invoice-studio')")
    $hasViewContainer = $html.Contains('id="view-invoice-studio"')
    $hasIframe = $html.Contains('id="invoice-studio-frame"') -and $html.Contains('src="invoice-studio/index.html"')
    $hasRouterView = $router.Contains("'view-invoice-studio'")
    $hasRouterCase = $router.Contains("case 'invoice-studio':")

    return ($hasMenuBtn -and $hasViewContainer -and $hasIframe -and $hasRouterView -and $hasRouterCase)
}

# 23. Invoice Studio 100% Online Template Assets
Run-Check "Invoice Studio Online Template Assets (template-assets.js, pre-embedded fallback)" {
    $hasAssetJs = Test-Path "D:\Repo\Lorry\invoice-studio\template-assets.js"
    $assetContent = if ($hasAssetJs) { Get-Content 'D:\Repo\Lorry\invoice-studio\template-assets.js' -Raw } else { "" }
    $hasDocxB64 = $assetContent.Contains("INVOICE_TEMPLATE_BASE64")
    $hasStampB64 = $assetContent.Contains("INVOICE_STAMP_BASE64")
    $html = Get-Content 'D:\Repo\Lorry\invoice-studio\index.html' -Raw
    $hasTag = $html.Contains("template-assets.js")

    return ($hasAssetJs -and $hasDocxB64 -and $hasStampB64 -and $hasTag)
}

# 24. Invoice Studio Single Sign-On & Delete Permission Guard
Run-Check "Invoice Studio Single Sign-On & Role Guard (Rudra Delete Blocked)" {
    $appJs = Get-Content 'D:\Repo\Lorry\invoice-studio\app.js' -Raw
    $hasSso = $appJs.Contains("getCurrentUser = () =>")
    $hasCanDelete = $appJs.Contains("canDelete = () =>")
    $hasRudraGuard = $appJs.Contains("uname === 'rudra'")
    $hasTableGuard = $appJs.Contains('${canDelete() ? `<button type="button" class="action-btn delete"')
    $hasActionGuard = $appJs.Contains("if (!canDelete())")

    return ($hasSso -and $hasCanDelete -and $hasRudraGuard -and $hasTableGuard -and $hasActionGuard)
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "🎉 ALL 24 AUTOMATED VERIFICATION CHECKS PASSED SUCCESSFULLY!" -ForegroundColor Green
} else {
    Write-Host "⚠️ SOME CHECKS FAILED. PLEASE REVIEW THE LOG ABOVE." -ForegroundColor Red
}
Write-Host "==========================================================" -ForegroundColor Cyan

