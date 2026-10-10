$dosyalar = @('codex/kanit/02-panel-2.txt', 'codex/RAPOR/codex-02.log')
foreach ($dosya in $dosyalar) {
  if (-not (Test-Path -LiteralPath $dosya)) { continue }
  $yol = (Resolve-Path -LiteralPath $dosya).Path
  $akim = [System.IO.File]::Open($yol, [System.IO.FileMode]::Open, [System.IO.FileAccess]::ReadWrite,
    [System.IO.FileShare]::ReadWrite)
  try {
    $baytlar = New-Object byte[] $akim.Length
    [void]$akim.Read($baytlar, 0, $baytlar.Length)
    # Tek baytlı okuma, UTF-8 günlükteki diğer metinlere dokunmadan kesin konum verir.
    $metin = [System.Text.Encoding]::GetEncoding(28591).GetString($baytlar)
    $eslesmeler = [regex]::Matches($metin, 'seker_oturum=[A-Za-z0-9_.-]+')
    foreach ($eslesme in $eslesmeler) {
      $maske = 'seker_oturum=[gizlendi]'.PadRight($eslesme.Length, '*')
      $yeni = [System.Text.Encoding]::ASCII.GetBytes($maske)
      [void]$akim.Seek($eslesme.Index, [System.IO.SeekOrigin]::Begin)
      $akim.Write($yeni, 0, $yeni.Length)
    }
    Write-Output "$dosya : $($eslesmeler.Count) oturum degeri maskelendi; diger baytlar korundu."
  } finally { $akim.Dispose() }
}
