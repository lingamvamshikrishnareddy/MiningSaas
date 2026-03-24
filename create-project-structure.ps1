# PowerShell Script to Create Mining Fleet Management System Structure
# Run this script in the root directory where you want to create the project

Write-Host "Creating Mining Fleet Management System Structure..." -ForegroundColor Green

# Root files
$rootFiles = @(
    ".env",
    ".env.example",
    ".gitignore",
    "README.md",
    "docker-compose.yml",
    "package.json"
)

# Prisma directory
$prismaFiles = @(
    "prisma/schema.prisma",
    "prisma/seed.ts"
)

$prismaDir = "prisma/migrations"

# Server structure
$serverDirs = @(
    "src/server/config",
    "src/server/middleware",
    "src/server/routes",
    "src/server/controllers",
    "src/server/services",
    "src/server/repositories",
    "src/server/validators",
    "src/server/types",
    "src/server/utils",
    "src/server/websocket/handlers",
    "src/server/jobs/processors",
    "src/server/jobs/schedulers",
    "src/server/db"
)

$serverFiles = @(
    "src/server/index.ts",
    "src/server/app.ts",
    
    # Config
    "src/server/config/database.ts",
    "src/server/config/auth.ts",
    "src/server/config/redis.ts",
    "src/server/config/environment.ts",
    
    # Middleware
    "src/server/middleware/auth.middleware.ts",
    "src/server/middleware/error.middleware.ts",
    "src/server/middleware/validation.middleware.ts",
    "src/server/middleware/cors.middleware.ts",
    "src/server/middleware/logger.middleware.ts",
    
    # Routes
    "src/server/routes/index.ts",
    "src/server/routes/auth.routes.ts",
    "src/server/routes/users.routes.ts",
    "src/server/routes/organizations.routes.ts",
    "src/server/routes/sites.routes.ts",
    "src/server/routes/equipment.routes.ts",
    "src/server/routes/maintenance.routes.ts",
    "src/server/routes/telemetry.routes.ts",
    "src/server/routes/fuel.routes.ts",
    "src/server/routes/production.routes.ts",
    "src/server/routes/inspections.routes.ts",
    "src/server/routes/incidents.routes.ts",
    "src/server/routes/shifts.routes.ts",
    "src/server/routes/analytics.routes.ts",
    
    # Controllers
    "src/server/controllers/auth.controller.ts",
    "src/server/controllers/users.controller.ts",
    "src/server/controllers/organizations.controller.ts",
    "src/server/controllers/sites.controller.ts",
    "src/server/controllers/equipment.controller.ts",
    "src/server/controllers/maintenance.controller.ts",
    "src/server/controllers/telemetry.controller.ts",
    "src/server/controllers/fuel.controller.ts",
    "src/server/controllers/production.controller.ts",
    "src/server/controllers/inspections.controller.ts",
    "src/server/controllers/incidents.controller.ts",
    "src/server/controllers/shifts.controller.ts",
    "src/server/controllers/analytics.controller.ts",
    
    # Services
    "src/server/services/auth.service.ts",
    "src/server/services/users.service.ts",
    "src/server/services/organizations.service.ts",
    "src/server/services/sites.service.ts",
    "src/server/services/equipment.service.ts",
    "src/server/services/maintenance.service.ts",
    "src/server/services/telemetry.service.ts",
    "src/server/services/fuel.service.ts",
    "src/server/services/production.service.ts",
    "src/server/services/inspections.service.ts",
    "src/server/services/incidents.service.ts",
    "src/server/services/shifts.service.ts",
    "src/server/services/analytics.service.ts",
    "src/server/services/notification.service.ts",
    "src/server/services/email.service.ts",
    
    # Repositories
    "src/server/repositories/base.repository.ts",
    "src/server/repositories/users.repository.ts",
    "src/server/repositories/equipment.repository.ts",
    "src/server/repositories/maintenance.repository.ts",
    "src/server/repositories/telemetry.repository.ts",
    "src/server/repositories/analytics.repository.ts",
    
    # Validators
    "src/server/validators/auth.validator.ts",
    "src/server/validators/equipment.validator.ts",
    "src/server/validators/maintenance.validator.ts",
    "src/server/validators/common.validator.ts",
    
    # Types
    "src/server/types/auth.types.ts",
    "src/server/types/equipment.types.ts",
    "src/server/types/maintenance.types.ts",
    "src/server/types/api.types.ts",
    "src/server/types/common.types.ts",
    
    # Utils
    "src/server/utils/jwt.util.ts",
    "src/server/utils/hash.util.ts",
    "src/server/utils/date.util.ts",
    "src/server/utils/pagination.util.ts",
    "src/server/utils/calculations.util.ts",
    "src/server/utils/logger.util.ts",
    
    # WebSocket
    "src/server/websocket/index.ts",
    "src/server/websocket/events.ts",
    "src/server/websocket/handlers/telemetry.handler.ts",
    "src/server/websocket/handlers/notifications.handler.ts",
    
    # Jobs
    "src/server/jobs/index.ts",
    "src/server/jobs/queue.ts",
    "src/server/jobs/processors/maintenance-scheduler.processor.ts",
    "src/server/jobs/processors/report-generator.processor.ts",
    "src/server/jobs/processors/data-aggregation.processor.ts",
    "src/server/jobs/schedulers/daily-kpi.scheduler.ts",
    "src/server/jobs/schedulers/notification.scheduler.ts",
    
    # Database
    "src/server/db/prisma.ts"
)

# Client structure
$clientDirs = @(
    "src/client/app/(auth)/login",
    "src/client/app/(auth)/register",
    "src/client/app/(dashboard)/dashboard",
    "src/client/app/(dashboard)/equipment/[id]/edit",
    "src/client/app/(dashboard)/equipment/new",
    "src/client/app/(dashboard)/maintenance/schedule",
    "src/client/app/(dashboard)/maintenance/history",
    "src/client/app/(dashboard)/maintenance/[id]",
    "src/client/app/(dashboard)/telemetry/live",
    "src/client/app/(dashboard)/telemetry/[equipmentId]",
    "src/client/app/(dashboard)/fuel/logs",
    "src/client/app/(dashboard)/fuel/analytics",
    "src/client/app/(dashboard)/production/reports",
    "src/client/app/(dashboard)/inspections/new",
    "src/client/app/(dashboard)/inspections/[id]",
    "src/client/app/(dashboard)/safety/incidents/[id]",
    "src/client/app/(dashboard)/safety/reports",
    "src/client/app/(dashboard)/analytics/fleet",
    "src/client/app/(dashboard)/analytics/maintenance",
    "src/client/app/(dashboard)/analytics/production",
    "src/client/app/(dashboard)/sites/[id]",
    "src/client/app/(dashboard)/settings/profile",
    "src/client/app/(dashboard)/settings/organization",
    "src/client/app/(dashboard)/settings/users",
    "src/client/app/api/health",
    "src/client/components/ui",
    "src/client/components/layout",
    "src/client/components/equipment",
    "src/client/components/maintenance",
    "src/client/components/telemetry",
    "src/client/components/charts",
    "src/client/components/forms",
    "src/client/components/common",
    "src/client/lib",
    "src/client/hooks",
    "src/client/stores",
    "src/client/types",
    "src/client/styles"
)

$clientFiles = @(
    # Root app files
    "src/client/app/layout.tsx",
    "src/client/app/page.tsx",
    "src/client/app/globals.css",
    
    # Auth pages
    "src/client/app/(auth)/layout.tsx",
    "src/client/app/(auth)/login/page.tsx",
    "src/client/app/(auth)/register/page.tsx",
    
    # Dashboard layout
    "src/client/app/(dashboard)/layout.tsx",
    
    # Dashboard pages
    "src/client/app/(dashboard)/dashboard/page.tsx",
    "src/client/app/(dashboard)/equipment/page.tsx",
    "src/client/app/(dashboard)/equipment/[id]/page.tsx",
    "src/client/app/(dashboard)/equipment/[id]/edit/page.tsx",
    "src/client/app/(dashboard)/equipment/new/page.tsx",
    "src/client/app/(dashboard)/maintenance/page.tsx",
    "src/client/app/(dashboard)/maintenance/schedule/page.tsx",
    "src/client/app/(dashboard)/maintenance/history/page.tsx",
    "src/client/app/(dashboard)/maintenance/[id]/page.tsx",
    "src/client/app/(dashboard)/telemetry/page.tsx",
    "src/client/app/(dashboard)/telemetry/live/page.tsx",
    "src/client/app/(dashboard)/telemetry/[equipmentId]/page.tsx",
    "src/client/app/(dashboard)/fuel/page.tsx",
    "src/client/app/(dashboard)/fuel/logs/page.tsx",
    "src/client/app/(dashboard)/fuel/analytics/page.tsx",
    "src/client/app/(dashboard)/production/page.tsx",
    "src/client/app/(dashboard)/production/reports/page.tsx",
    "src/client/app/(dashboard)/inspections/page.tsx",
    "src/client/app/(dashboard)/inspections/new/page.tsx",
    "src/client/app/(dashboard)/inspections/[id]/page.tsx",
    "src/client/app/(dashboard)/safety/page.tsx",
    "src/client/app/(dashboard)/safety/incidents/page.tsx",
    "src/client/app/(dashboard)/safety/incidents/[id]/page.tsx",
    "src/client/app/(dashboard)/safety/reports/page.tsx",
    "src/client/app/(dashboard)/analytics/page.tsx",
    "src/client/app/(dashboard)/analytics/fleet/page.tsx",
    "src/client/app/(dashboard)/analytics/maintenance/page.tsx",
    "src/client/app/(dashboard)/analytics/production/page.tsx",
    "src/client/app/(dashboard)/sites/page.tsx",
    "src/client/app/(dashboard)/sites/[id]/page.tsx",
    "src/client/app/(dashboard)/settings/page.tsx",
    "src/client/app/(dashboard)/settings/profile/page.tsx",
    "src/client/app/(dashboard)/settings/organization/page.tsx",
    "src/client/app/(dashboard)/settings/users/page.tsx",
    
    # API routes
    "src/client/app/api/health/route.ts",
    
    # UI Components
    "src/client/components/ui/button.tsx",
    "src/client/components/ui/card.tsx",
    "src/client/components/ui/dialog.tsx",
    "src/client/components/ui/dropdown-menu.tsx",
    "src/client/components/ui/input.tsx",
    "src/client/components/ui/label.tsx",
    "src/client/components/ui/table.tsx",
    "src/client/components/ui/tabs.tsx",
    "src/client/components/ui/select.tsx",
    "src/client/components/ui/badge.tsx",
    "src/client/components/ui/alert.tsx",
    "src/client/components/ui/toast.tsx",
    
    # Layout Components
    "src/client/components/layout/Header.tsx",
    "src/client/components/layout/Sidebar.tsx",
    "src/client/components/layout/Footer.tsx",
    "src/client/components/layout/MobileNav.tsx",
    
    # Equipment Components
    "src/client/components/equipment/EquipmentCard.tsx",
    "src/client/components/equipment/EquipmentList.tsx",
    "src/client/components/equipment/EquipmentForm.tsx",
    "src/client/components/equipment/EquipmentStatus.tsx",
    "src/client/components/equipment/EquipmentFilters.tsx",
    
    # Maintenance Components
    "src/client/components/maintenance/MaintenanceCalendar.tsx",
    "src/client/components/maintenance/MaintenanceForm.tsx",
    "src/client/components/maintenance/MaintenanceHistory.tsx",
    "src/client/components/maintenance/MaintenanceCard.tsx",
    
    # Telemetry Components
    "src/client/components/telemetry/LiveDashboard.tsx",
    "src/client/components/telemetry/TelemetryChart.tsx",
    "src/client/components/telemetry/AlertPanel.tsx",
    "src/client/components/telemetry/EquipmentMap.tsx",
    
    # Chart Components
    "src/client/components/charts/LineChart.tsx",
    "src/client/components/charts/BarChart.tsx",
    "src/client/components/charts/PieChart.tsx",
    "src/client/components/charts/GaugeChart.tsx",
    
    # Form Components
    "src/client/components/forms/LoginForm.tsx",
    "src/client/components/forms/RegisterForm.tsx",
    "src/client/components/forms/DateRangePicker.tsx",
    
    # Common Components
    "src/client/components/common/LoadingSpinner.tsx",
    "src/client/components/common/ErrorBoundary.tsx",
    "src/client/components/common/EmptyState.tsx",
    "src/client/components/common/StatusBadge.tsx",
    "src/client/components/common/DataTable.tsx",
    "src/client/components/common/SearchInput.tsx",
    
    # Lib
    "src/client/lib/api.ts",
    "src/client/lib/auth.ts",
    "src/client/lib/utils.ts",
    "src/client/lib/constants.ts",
    "src/client/lib/validators.ts",
    "src/client/lib/formatters.ts",
    
    # Hooks
    "src/client/hooks/useAuth.ts",
    "src/client/hooks/useEquipment.ts",
    "src/client/hooks/useMaintenance.ts",
    "src/client/hooks/useTelemetry.ts",
    "src/client/hooks/useWebSocket.ts",
    "src/client/hooks/useDebounce.ts",
    "src/client/hooks/useLocalStorage.ts",
    
    # Stores
    "src/client/stores/authStore.ts",
    "src/client/stores/equipmentStore.ts",
    "src/client/stores/notificationStore.ts",
    "src/client/stores/uiStore.ts",
    
    # Types
    "src/client/types/equipment.types.ts",
    "src/client/types/maintenance.types.ts",
    "src/client/types/telemetry.types.ts",
    "src/client/types/user.types.ts",
    "src/client/types/api.types.ts",
    
    # Styles
    "src/client/styles/custom.css"
)

# Shared structure
$sharedDirs = @(
    "src/shared/types",
    "src/shared/constants",
    "src/shared/validators"
)

$sharedFiles = @(
    "src/shared/types/common.types.ts",
    "src/shared/constants/enums.ts",
    "src/shared/validators/schemas.ts"
)

# Scripts
$scriptsDir = "scripts"
$scriptFiles = @(
    "scripts/setup.sh",
    "scripts/migrate.sh",
    "scripts/seed-demo-data.ts"
)

# Config files
$configFiles = @(
    "config/tsconfig.json",
    "config/tsconfig.server.json",
    "config/next.config.js",
    "config/tailwind.config.js",
    "config/.eslintrc.json",
    "config/.prettierrc"
)

# Function to create directories
function Create-Directories {
    param (
        [string[]]$directories
    )
    
    foreach ($dir in $directories) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Host "Created directory: $dir" -ForegroundColor Cyan
        }
    }
}

# Function to create files
function Create-Files {
    param (
        [string[]]$files
    )
    
    foreach ($file in $files) {
        $dir = Split-Path -Parent $file
        if ($dir -and -not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
        
        if (-not (Test-Path $file)) {
            New-Item -ItemType File -Path $file -Force | Out-Null
            Write-Host "Created file: $file" -ForegroundColor Yellow
        }
    }
}

# Create root files
Write-Host "`nCreating root files..." -ForegroundColor Magenta
Create-Files -files $rootFiles

# Create Prisma structure
Write-Host "`nCreating Prisma structure..." -ForegroundColor Magenta
Create-Files -files $prismaFiles
Create-Directories -directories @($prismaDir)

# Create server structure
Write-Host "`nCreating server structure..." -ForegroundColor Magenta
Create-Directories -directories $serverDirs
Create-Files -files $serverFiles

# Create client structure
Write-Host "`nCreating client structure..." -ForegroundColor Magenta
Create-Directories -directories $clientDirs
Create-Files -files $clientFiles

# Create shared structure
Write-Host "`nCreating shared structure..." -ForegroundColor Magenta
Create-Directories -directories $sharedDirs
Create-Files -files $sharedFiles

# Create scripts
Write-Host "`nCreating scripts..." -ForegroundColor Magenta
Create-Directories -directories @($scriptsDir)
Create-Files -files $scriptFiles

# Create config directory and files
Write-Host "`nCreating config files..." -ForegroundColor Magenta
Create-Directories -directories @("config")
Create-Files -files $configFiles

Write-Host "`n✅ Project structure created successfully!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Update .env file with your environment variables"
Write-Host "2. Install dependencies: npm install"
Write-Host "3. Run database migrations: npm run migrate"
Write-Host "4. Start development server: npm run dev"