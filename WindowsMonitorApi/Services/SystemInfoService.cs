using System;
using System.Diagnostics;
using System.Linq;
using System.Net.NetworkInformation;
using System.Runtime.InteropServices;

namespace WindowsMonitorApi.Services
{
    public class SystemInfoService
    {
        public dynamic GetSystemInfo()
        {
            return new
            {
                CpuUsage = GetCpuUsage(),
                MemoryUsage = GetMemoryUsage(),
                DiskUsage = GetDiskUsage(),
                NetworkUsage = GetNetworkUsage(),
                Processes = GetProcesses(),
                SystemInfo = GetSystemInformation(),
                Timestamp = DateTime.UtcNow
            };
        }

        private float GetCpuUsage()
        {
            if (!RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                return 0; // will return 0 for non-Windows platforms
            }

            try
            {
                using var cpuCounter = new PerformanceCounter("Processor", "% Processor Time", "_Total");
                cpuCounter.NextValue();
                Thread.Sleep(1000); 
                return cpuCounter.NextValue();
            }
            catch
            {
                return 0;
            }
        }

        private dynamic GetMemoryUsage()
        {
            try
            {
                var gcMemoryInfo = GC.GetGCMemoryInfo();
                var totalMemory = gcMemoryInfo.TotalAvailableMemoryBytes;
                var usedMemory = Process.GetCurrentProcess().WorkingSet64;
                var availableMemory = totalMemory - usedMemory;
                var percentUsed = (double)usedMemory / totalMemory * 100;

                return new
                {
                    TotalMB = Math.Round(totalMemory / (1024 * 1024.0), 2),
                    UsedMB = Math.Round(usedMemory / (1024 * 1024.0), 2),
                    AvailableMB = Math.Round(availableMemory / (1024 * 1024.0), 2),
                    PercentUsed = Math.Round(percentUsed, 2)
                };
            }
            catch
            {
                return new
                {
                    TotalMB = 0,
                    UsedMB = 0,
                    AvailableMB = 0,
                    PercentUsed = 0
                };
            }
        }

        private dynamic GetDiskUsage()
        {
            try
            {
                var drive = new DriveInfo("C");
                return new
                {
                    TotalGB = Math.Round(drive.TotalSize / (1024 * 1024 * 1024.0), 2),
                    UsedGB = Math.Round((drive.TotalSize - drive.AvailableFreeSpace) / (1024 * 1024 * 1024.0), 2),
                    FreeGB = Math.Round(drive.AvailableFreeSpace / (1024 * 1024 * 1024.0), 2),
                    PercentUsed = Math.Round((drive.TotalSize - drive.AvailableFreeSpace) / (double)drive.TotalSize * 100, 2)
                };
            }
            catch
            {
                return new
                {
                    TotalGB = 0,
                    UsedGB = 0,
                    FreeGB = 0,
                    PercentUsed = 0
                };
            }
        }

        private dynamic GetNetworkUsage()
        {
            try
            {
                var interfaces = NetworkInterface.GetAllNetworkInterfaces()
                    .Where(n => n.OperationalStatus == OperationalStatus.Up &&
                               n.NetworkInterfaceType != NetworkInterfaceType.Loopback)
                    .ToList();

                var stats = interfaces.Select(n => new
                {
                    n.Name,
                    UploadSpeed = Math.Round(n.GetIPStatistics().BytesSent / 1024.0, 2),
                    DownloadSpeed = Math.Round(n.GetIPStatistics().BytesReceived / 1024.0, 2),
                    SpeedMBps = n.Speed / (1024 * 1024.0)
                }).FirstOrDefault();

                return stats ?? new { Name = "None", UploadSpeed = 0.0, DownloadSpeed = 0.0, SpeedMBps = 0.0 };
            }
            catch
            {
                return new { Name = "None", UploadSpeed = 0.0, DownloadSpeed = 0.0, SpeedMBps = 0.0 };
            }
        }

        private List<dynamic> GetProcesses()
        {
            try
            {
                return [.. Process.GetProcesses()
                    .OrderByDescending(p => p.WorkingSet64)
                    .Take(10)
                    .Select(p => new
                    {
                        Name = p.ProcessName,
                        PID = p.Id,
                        MemoryMB = Math.Round(p.WorkingSet64 / (1024 * 1024.0), 2),
                        CPU = GetProcessCpuUsage(p)
                    })];
            }
            catch
            {
                return [];
            }
        }

        private float GetProcessCpuUsage(Process process)
        {
            if (!RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                return 0; 
            }

            try
            {
                using var pc = new PerformanceCounter("Process", "% Processor Time", process.ProcessName);
                pc.NextValue();
                Thread.Sleep(500);
                return pc.NextValue() / Environment.ProcessorCount;
            }
            catch
            {
                return 0;
            }
        }

        private dynamic GetSystemInformation()
        {
            try
            {
                return new
                {
                    OSName = RuntimeInformation.OSDescription,
                    OSVersion = Environment.OSVersion.VersionString,
                    Environment.MachineName,
                    CpuName = "Unknown", // Can't get CPU name cross-platform without WMI
                    CpuCores = Environment.ProcessorCount,
                    Environment.UserName
                };
            }
            catch
            {
                return new
                {
                    OSName = "Unknown",
                    OSVersion = "Unknown",
                    MachineName = "Unknown",
                    CpuName = "Unknown",
                    CpuCores = 0,
                    UserName = "Unknown"
                };
            }
        }
    }
}