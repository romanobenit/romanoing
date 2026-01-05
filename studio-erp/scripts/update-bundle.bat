@echo off
REM Script per importare catalogo bundle su Windows
REM Uso: scripts\update-bundle.bat

echo Importazione catalogo bundle (8 bundle)...
echo.

REM Leggi credenziali da .env
for /f "tokens=1,2 delims==" %%a in ('findstr /r "^DATABASE_URL=" .env') do set DATABASE_URL=%%b

REM Estrai componenti dall'URL
REM Formato: postgresql://user:password@host:port/database?schema=public

if "%DATABASE_URL%"=="" (
    echo ERRORE: DATABASE_URL non configurato in .env
    exit /b 1
)

REM Per ora usa credenziali hardcoded (sostituisci con parsing se necessario)
set PGHOST=localhost
set PGPORT=5432
set PGDATABASE=studio_erp
set PGUSER=studio_user

echo Connessione a PostgreSQL...
echo Host: %PGHOST%
echo Database: %PGDATABASE%
echo User: %PGUSER%
echo.
echo Ti verra' richiesta la password...
echo.

psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -f prisma\update-bundle-completo.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ Import completato con successo!
    echo.
    echo Verifica bundle importati:
    psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -c "SELECT COUNT(*) as total FROM bundle;"
) else (
    echo.
    echo ✗ Errore durante import
    exit /b 1
)
