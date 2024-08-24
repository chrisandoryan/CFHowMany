document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.getElementById('cloudflareData');
    const downloadButton = document.getElementById('downloadCsv');

    chrome.storage.local.get("cloudflareData", function (result) {
        const cloudflareData = result.cloudflareData || [];

        cloudflareData.forEach(item => {
            const row = document.createElement('tr');
            const domainCell = document.createElement('td');
            const firstVisitCell = document.createElement('td');
            const lastVisitCell = document.createElement('td');
            const visitCountCell = document.createElement('td');
            const referrerCell = document.createElement('td');

            domainCell.textContent = item.domain;
            firstVisitCell.textContent = item.firstVisitTime;
            lastVisitCell.textContent = item.lastVisitTime;
            visitCountCell.textContent = item.visitCount;
            referrerCell.textContent = item.referrer;

            row.appendChild(domainCell);
            row.appendChild(firstVisitCell);
            row.appendChild(lastVisitCell);
            row.appendChild(visitCountCell);
            row.appendChild(referrerCell);
            tableBody.appendChild(row);
        });
    });

    function convertToCSV(data) {
        const headers = ["Domain", "First Visit", "Last Visit", "Visit Count", "Referer"];
        const rows = data.map(item => [
            item.domain,
            item.firstVisitTime,
            item.lastVisitTime,
            item.visitCount,
            item.referrer
        ]);

        let csvContent = headers.join(",") + "\n";
        csvContent += rows.map(row => row.join(",")).join("\n");

        return csvContent;
    }

    function downloadCSVFile(csvContent) {
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "cloudflare_domains.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    downloadButton.addEventListener('click', function () {
        chrome.storage.local.get("cloudflareData", function (result) {
            const cloudflareData = result.cloudflareData || [];
            const csvContent = convertToCSV(cloudflareData);
            downloadCSVFile(csvContent);
        });
    });
});
