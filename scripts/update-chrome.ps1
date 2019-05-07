dir "C:\Program Files (x86)\Google\Chrome\Application\"
$exitCode = 0

try
{
    $Arguments = ('chrome.msi', '/fa', '/norestart', '/l*v install.log' )

    Write-Host "Starting Chrome Install..."
    $process = Start-Process -FilePath msiexec.exe -ArgumentList $Arguments -Wait -PassThru
    $exitCode = $process.ExitCode

    if ($exitCode -eq 0 -or $exitCode -eq 3010)
    {
        Write-Host -Object 'Installation successful'
    }
    else
    {
        Write-Host -Object "Non zero exit code returned by the installation process : $exitCode."
    }
}
catch
{
    Write-Host -Object "Failed to install the Chrome MSI"
    Write-Host -Object $_.Exception.Message
    $exitCode = -1
}

cat install.log
dir "C:\Program Files (x86)\Google\Chrome\Application\"

return exitCode
