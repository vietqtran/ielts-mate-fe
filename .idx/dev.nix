{pkgs}: {
  channel = "stable-24.05";
  packages = [
    pkgs.nodejs_20
    pkgs.yarn
    pkgs.gnumake42
  ];
  services = {
    docker = {
      enable = true;
    };
  };
  idx.extensions = [];
}