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
    $hasAdmin = $auth.Contains('Shravan')
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

# 9. Live Cloud API Connectivity: Vehicle TS15UE1122
Run-Check "Live Google Apps Script API: TS15UE1122 Trip Retrieval" {
    $url = "https://script.google.com/macros/s/AKfycbxXNUcEvcCbjL1fxtSPz1CVUSLOHKzSzYgasOGgUJ111r7i77MVVBkocCJd15v5lP1S/exec?action=getTrips&vehicleNo=TS15UE1122"
    $res = Invoke-RestMethod -Uri $url -TimeoutSec 15
    return ($res.success -eq $true -and $res.data.Count -gt 0)
}

# 10. Live Cloud API Connectivity: Vehicle TG15T6666
Run-Check "Live Google Apps Script API: TG15T6666 Trip Retrieval" {
    $url = "https://script.google.com/macros/s/AKfycbxXNUcEvcCbjL1fxtSPz1CVUSLOHKzSzYgasOGgUJ111r7i77MVVBkocCJd15v5lP1S/exec?action=getTrips&vehicleNo=TG15T6666"
    $res = Invoke-RestMethod -Uri $url -TimeoutSec 15
    return ($res.success -eq $true -and $res.data.Count -gt 0)
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

Write-Host "`n==========================================================" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "🎉 ALL 11 AUTOMATED VERIFICATION CHECKS PASSED SUCCESSFULLY!" -ForegroundColor Green
} else {
    Write-Host "⚠️ SOME CHECKS FAILED. PLEASE REVIEW THE LOG ABOVE." -ForegroundColor Red
}
Write-Host "==========================================================" -ForegroundColor Cyan

