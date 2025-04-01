function Remove-ItemSafely {
    param (
        [string]$Path,
        [string]$Description
    )
    
    if (Test-Path $Path) {
        Remove-Item -Path $Path -Force -Recurse -ErrorAction SilentlyContinue
    }
}

# Clean Docker
if ((Get-Service -Name "docker" -ErrorAction SilentlyContinue).Status -eq "Running") {
    docker system prune -af -q
    docker volume prune -f -q
}

# Clean Terraform
$terraformPaths = @(
    ".\**\.terraform",
    ".\**\.terraform.lock.hcl",
    ".\**\terraform.tfstate*"
)

foreach ($path in $terraformPaths) {
    Get-ChildItem -Path $path -Force -ErrorAction SilentlyContinue | 
        ForEach-Object {
            Remove-Item $_.FullName -Force -Recurse -ErrorAction SilentlyContinue
        }
}

# Clean Ansible
$ansiblePaths = @(
    "$HOME\.ansible",
    "$PWD\ansible-workspace",
    "$PWD\.ansible-tmp"
)

foreach ($path in $ansiblePaths) {
    Remove-ItemSafely -Path $path -Description "Ansible"
}

# Clean Jenkins workspace
$jenkinsWorkspaces = @(
    "${env:ProgramFiles}\Jenkins\workspace\travel-planner*",
    "${env:LOCALAPPDATA}\Jenkins\.jenkins\workspace\travel-planner*"
)

foreach ($workspace in $jenkinsWorkspaces) {
    Remove-ItemSafely -Path $workspace -Description "Jenkins"
}