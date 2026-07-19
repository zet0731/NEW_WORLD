try {
    $body = '{"username":"Jok2r","password":"test123"}'
    $r = Invoke-WebRequest -Uri 'http://127.0.0.1:8787/api/login' -Method POST -ContentType 'application/json' -Body $body -UseBasicParsing
    Write-Output ("Status: " + $r.StatusCode)
    Write-Output ("Body: " + $r.Content)
} catch {
    Write-Output ("HTTP Error: " + $_.Exception.Message)
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Output ("Response body: " + $reader.ReadToEnd())
    }
}
