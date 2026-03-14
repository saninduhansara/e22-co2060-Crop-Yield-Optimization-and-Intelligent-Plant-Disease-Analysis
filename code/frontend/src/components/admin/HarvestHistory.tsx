import { Search, Download, Loader, RefreshCw, FileText, Wheat, TrendingUp, X, FileJson, File } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { farmAPI } from '../../services/api';
import { formatNumber } from '../../utils/numberUtils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Harvest {
  harvestId: string;
  farmId: string;
  farmName: string;
  farmerName: string;
  farmerNIC: string;
  season: string;
  year: number;
  crop: string;
  location: string;
  district: string;
  acres: number;
  harvestQty: number;
  yieldPerAcre: number;
  harvestDate: string;
}

export function HarvestHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [harvests, setHarvests] = useState([] as Harvest[]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null as string | null);
  const [refreshingPoints, setRefreshingPoints] = useState(false);

  const [availableCrops, setAvailableCrops] = useState<string[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  useEffect(() => {
    fetchCrops();
    fetchHarvestHistory();
  }, []);

  const fetchCrops = async () => {
    try {
      const data = await farmAPI.getAllCrops();
      setAvailableCrops(data.crops || []);
    } catch (error) {
      console.error('Error fetching crops:', error);
    }
  };

  const fetchHarvestHistory = async () => {
    try {
      setLoading(true);
      const data = await farmAPI.getHarvestHistory();
      setHarvests(data.harvests || []);
    } catch (err: any) {
      console.error('Error fetching harvest history:', err);
      setError('Failed to load harvest history');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshPoints = async () => {
    try {
      setRefreshingPoints(true);
      await farmAPI.recalculatePoints();
      await fetchHarvestHistory();
    } catch (err) {
      console.error("Failed to refresh points", err);
    } finally {
      setRefreshingPoints(false);
    }
  };

  const generateCSVContent = () => {
    const headers = ['Farmer Name', 'Farmer NIC', 'Farm Name', 'Location', 'District', 'Season', 'Year', 'Crop', 'Acres', 'Harvest Qty (kg)', 'Yield/Acre (kg)', 'Harvest Date'];
    
    const rows = filteredHarvests.map(harvest => [
      `"${harvest.farmerName}"`,
      `"${harvest.farmerNIC}"`,
      `"${harvest.farmName}"`,
      `"${harvest.location}"`,
      `"${harvest.district}"`,
      `"${harvest.season}"`,
      harvest.year,
      `"${harvest.crop}"`,
      harvest.acres.toFixed(2),
      harvest.harvestQty.toFixed(2),
      harvest.yieldPerAcre.toFixed(2),
      new Date(harvest.harvestDate).toLocaleDateString()
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  };

  const downloadFile = (content: string | Uint8Array, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (filteredHarvests.length === 0) {
      alert('No data to export');
      return;
    }

    const csvContent = generateCSVContent();
    const timestamp = new Date().toISOString().slice(0, 10);
    downloadFile(csvContent, `harvest_report_${timestamp}.csv`, 'text/csv;charset=utf-8;');
    toast.success('Report downloaded successfully.');
    setShowDownloadModal(false);
  };

  const handleExportExcel = () => {
    if (filteredHarvests.length === 0) {
      alert('No data to export');
      setShowDownloadModal(false);
      return;
    }

    setExportingFormat('excel');
    
    try {
      // Create HTML table for Excel
      const headers = ['Farmer Name', 'Farmer NIC', 'Farm Name', 'Location', 'District', 'Season', 'Year', 'Crop', 'Acres', 'Harvest Qty (kg)', 'Yield/Acre (kg)', 'Harvest Date'];
      
      let htmlContent = '<table border="1"><tr>';
      headers.forEach(h => {
        htmlContent += `<th style="background-color: #22c55e; color: white; padding: 10px;">${h}</th>`;
      });
      htmlContent += '</tr>';
      
      filteredHarvests.forEach(harvest => {
        htmlContent += '<tr>';
        htmlContent += `<td>${harvest.farmerName}</td>`;
        htmlContent += `<td>${harvest.farmerNIC}</td>`;
        htmlContent += `<td>${harvest.farmName}</td>`;
        htmlContent += `<td>${harvest.location}</td>`;
        htmlContent += `<td>${harvest.district}</td>`;
        htmlContent += `<td>${harvest.season}</td>`;
        htmlContent += `<td>${harvest.year}</td>`;
        htmlContent += `<td>${harvest.crop}</td>`;
        htmlContent += `<td>${harvest.acres.toFixed(2)}</td>`;
        htmlContent += `<td>${harvest.harvestQty.toFixed(2)}</td>`;
        htmlContent += `<td>${harvest.yieldPerAcre.toFixed(2)}</td>`;
        htmlContent += `<td>${new Date(harvest.harvestDate).toLocaleDateString()}</td>`;
        htmlContent += '</tr>';
      });
      htmlContent += '</table>';

      // Create the Excel file using HTML
      const excelContent = `
        <html xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head>
          <meta charset="UTF-8">
          <style>
            table { border-collapse: collapse; width: 100%; }
            th { background-color: #22c55e; color: white; padding: 10px; text-align: left; }
            td { padding: 8px; border: 1px solid #ddd; }
            tr:nth-child(even) { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `;

      const timestamp = new Date().toISOString().slice(0, 10);
      downloadFile(excelContent, `harvest_report_${timestamp}.xls`, 'application/vnd.ms-excel;charset=utf-8;');
      toast.success('Report downloaded successfully.');
      setShowDownloadModal(false);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export to Excel');
    } finally {
      setExportingFormat(null);
    }
  };

  const handleExportPDF = () => {
    if (filteredHarvests.length === 0) {
      alert('No data to export');
      setShowDownloadModal(false);
      return;
    }

    setExportingFormat('pdf');
    
    try {
      const doc = new jsPDF('landscape');
      
      // Add title
      doc.setFontSize(18);
      doc.setTextColor(34, 197, 94); // Green color
      doc.text('Harvest History Report', doc.internal.pageSize.width / 2, 15, { align: 'center' });
      
      // Add generation date
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const generatedDate = `Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
      doc.text(generatedDate, 14, 25);
      
      // Calculate statistics
      const totalYieldValue = filteredHarvests.reduce((sum, h) => sum + h.harvestQty, 0) / 1000; // Convert to tons
      const avgYieldPerAcreValue = filteredHarvests.length > 0
        ? filteredHarvests.reduce((sum, h) => sum + h.yieldPerAcre, 0) / filteredHarvests.length
        : 0;
      
      const cardStartY = 32;
      const cardHeight = 30;
      const leftCardX = 14;
      const rightCardX = 148;
      const cardWidth = 130;
      
      // Left Card - Filters Applied
      doc.setFillColor(240, 253, 244); // Light green background
      doc.rect(leftCardX, cardStartY, cardWidth, cardHeight, 'F');
      doc.setDrawColor(34, 197, 94);
      doc.setLineWidth(0.5);
      doc.rect(leftCardX, cardStartY, cardWidth, cardHeight, 'S');
      
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(34, 197, 94);
      doc.text('Filters Applied', leftCardX + 3, cardStartY + 6);
      
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      
      let filterY = cardStartY + 12;
      if (selectedCrop || selectedYear || selectedSeason) {
        if (selectedCrop) {
          doc.text(`Crop: ${selectedCrop}`, leftCardX + 3, filterY);
          filterY += 5;
        }
        if (selectedYear) {
          doc.text(`Year: ${selectedYear}`, leftCardX + 3, filterY);
          filterY += 5;
        }
        if (selectedSeason) {
          doc.text(`Season: ${selectedSeason}`, leftCardX + 3, filterY);
          filterY += 5;
        }
      } else {
        doc.setTextColor(100, 100, 100);
        doc.text('No filters applied', leftCardX + 3, filterY);
      }
      
      // Right Card - Summary Statistics
      doc.setFillColor(240, 253, 244);
      doc.rect(rightCardX, cardStartY, cardWidth, cardHeight, 'F');
      doc.setDrawColor(34, 197, 94);
      doc.rect(rightCardX, cardStartY, cardWidth, cardHeight, 'S');
      
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(34, 197, 94);
      doc.text('Summary Statistics', rightCardX + 3, cardStartY + 6);
      
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      
      let statsY = cardStartY + 12;
      doc.text(`Total Records: ${formatNumber(filteredHarvests.length)}`, rightCardX + 3, statsY);
      statsY += 5;
      doc.text(`Total Yield: ${formatNumber(totalYieldValue)} tons`, rightCardX + 3, statsY);
      statsY += 5;
      doc.text(`Average Yield per Acre: ${formatNumber(avgYieldPerAcreValue)} kg`, rightCardX + 3, statsY);
      
      const tableStartY = cardStartY + cardHeight + 5;
      
      // Prepare table data
      const headers = [
        ['Farmer Name', 'Farmer NIC', 'Farm Name', 'Location', 'District', 'Season', 'Year', 'Crop', 'Acres', 'Harvest Qty\n(kg)', 'Yield/Acre\n(kg)', 'Harvest Date']
      ];
      
      const data = filteredHarvests.map(harvest => [
        harvest.farmerName,
        harvest.farmerNIC,
        harvest.farmName,
        harvest.location,
        harvest.district,
        harvest.season,
        harvest.year.toString(),
        harvest.crop,
        harvest.acres.toFixed(2),
        harvest.harvestQty.toFixed(2),
        harvest.yieldPerAcre.toFixed(2),
        new Date(harvest.harvestDate).toLocaleDateString()
      ]);
      
      // Add table
      autoTable(doc, {
        head: headers,
        body: data,
        startY: tableStartY,
        theme: 'grid',
        styles: { 
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: { 
          fillColor: [34, 197, 94], // Green color
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 22 },
          2: { cellWidth: 25 },
          3: { cellWidth: 22 },
          4: { cellWidth: 20 },
          5: { cellWidth: 18 },
          6: { cellWidth: 15 },
          7: { cellWidth: 20 },
          8: { cellWidth: 15 },
          9: { cellWidth: 20 },
          10: { cellWidth: 20 },
          11: { cellWidth: 22 }
        }
      });
      
      // Save the PDF
      const timestamp = new Date().toISOString().slice(0, 10);
      doc.save(`harvest_report_${timestamp}.pdf`);
      toast.success('Report downloaded successfully.');
      
      setShowDownloadModal(false);
      setExportingFormat(null);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Failed to export to PDF');
      setExportingFormat(null);
    }
  };

  const handleExportData = () => {
    setShowDownloadModal(true);
  };

  const filteredHarvests = harvests.filter((harvest: Harvest) => {
    const matchesSearch = harvest.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      harvest.farmerNIC.toLowerCase().includes(searchTerm.toLowerCase()) ||
      harvest.farmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      harvest.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCrop = selectedCrop ? harvest.crop.toLowerCase() === selectedCrop.toLowerCase() : true;
    const matchesYear = selectedYear ? harvest.year.toString() === selectedYear : true;
    const matchesSeason = selectedSeason ? harvest.season.toLowerCase() === selectedSeason.toLowerCase() : true;

    return matchesSearch && matchesCrop && matchesYear && matchesSeason;
  });

  const totalYield = filteredHarvests.reduce((sum, h) => sum + h.harvestQty, 0) / 1000; // Convert to tons
  const avgYieldPerAcre = filteredHarvests.length > 0
    ? filteredHarvests.reduce((sum, h) => sum + h.yieldPerAcre, 0) / filteredHarvests.length
    : 0;

  const formattedTotalRecords = formatNumber(filteredHarvests.length);
  const formattedTotalYield = formatNumber(totalYield);
  const formattedAvgYieldPerAcre = formatNumber(avgYieldPerAcre);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-sm md:text-base text-gray-600">View all recorded harvest data and points</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefreshPoints}
            disabled={refreshingPoints}
            className="px-4 py-3 sm:px-6 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center gap-2 transition-colors whitespace-nowrap disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshingPoints ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{refreshingPoints ? 'Recalculating...' : 'Recalculate Points'}</span>
          </button>
          <button 
            onClick={handleExportData}
            className="px-4 py-3 sm:px-6 bg-green-700 hover:bg-green-800 text-white rounded-lg flex items-center justify-center gap-2 transition-colors whitespace-nowrap">
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">Export Data</span>
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by farmer name, NIC, or plot..."
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm md:text-base"
            />
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="flex-1 sm:flex-none px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base text-gray-700"
            >
              <option value="">All Crops</option>
              {['Paddy', 'Corn', 'Wheat', 'Tomatoes', 'Onions', 'Carrots', 'Cabbage', 'Potatoes', ...availableCrops]
                .filter((v, i, a) => a.indexOf(v) === i) // Unique
                .map(crop => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="flex-1 sm:flex-none px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base text-gray-700"
            >
              <option value="">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>

            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="flex-1 sm:flex-none px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base text-gray-700"
            >
              <option value="">All Seasons</option>
              <option value="Maha">Maha</option>
              <option value="Yala">Yala</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Total Harvests Card */}
        <div 
          style={{
            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
            border: '1px solid #BFDBFE',
            borderRadius: '14px',
            padding: '16px 20px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          className="hover:shadow-lg group"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.09)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)';
          }}
        >
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <p style={{ fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Harvests</p>
              <FileText className="w-5 h-5 text-blue-600 opacity-70 group-hover:opacity-100 transition-opacity" />
            </div>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#1D4ED8', marginBottom: '8px' }} className="break-words min-w-0">
              {formattedTotalRecords}
            </p>
            <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Filtered harvest entries</p>
          </div>
        </div>

        {/* Total Yield Card */}
        <div 
          style={{
            background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
            border: '1px solid #BBF7D0',
            borderRadius: '14px',
            padding: '16px 20px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          className="hover:shadow-lg group"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.09)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)';
          }}
        >
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <p style={{ fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Yield</p>
              <Wheat className="w-5 h-5 text-green-600 opacity-70 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-baseline gap-1 my-2">
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#15803D' }} className="break-words min-w-0">
                {formattedTotalYield}
              </p>
              <span style={{ fontSize: '13px', fontWeight: '400', color: '#9CA3AF', marginLeft: '4px' }}>tons</span>
            </div>
            <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Across selected filters</p>
          </div>
        </div>

        {/* Avg Yield/Acre Card */}
        <div 
          style={{
            background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
            border: '1px solid #FED7AA',
            borderRadius: '14px',
            padding: '16px 20px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          className="hover:shadow-lg group"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.09)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)';
          }}
        >
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <p style={{ fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Yield/Acre</p>
              <TrendingUp className="w-5 h-5 text-orange-600 opacity-70 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-baseline gap-1 my-2">
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#C2410C' }} className="break-words min-w-0">
                {formattedAvgYieldPerAcre}
              </p>
              <span style={{ fontSize: '13px', fontWeight: '400', color: '#9CA3AF', marginLeft: '4px' }}>kg</span>
            </div>
            <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Average yield per acre</p>
          </div>
        </div>
      </div>

      {/* Harvest History Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#F3F4F6' }}>
              <tr>
                <th style={{ fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '12px 16px', borderBottom: '2px solid #E5E7EB' }} className="text-left whitespace-nowrap">
                  Farmer
                </th>
                <th style={{ fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '12px 16px', borderBottom: '2px solid #E5E7EB' }} className="text-left whitespace-nowrap">
                  Farm Name
                </th>
                <th style={{ fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '12px 16px', borderBottom: '2px solid #E5E7EB' }} className="text-left whitespace-nowrap">
                  Location
                </th>
                <th style={{ fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '12px 16px', borderBottom: '2px solid #E5E7EB' }} className="text-left whitespace-nowrap">
                  Season
                </th>
                <th style={{ fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '12px 16px', borderBottom: '2px solid #E5E7EB' }} className="text-left whitespace-nowrap">
                  Year
                </th>
                <th style={{ fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '12px 16px', borderBottom: '2px solid #E5E7EB' }} className="text-left whitespace-nowrap">
                  Crop
                </th>
                <th style={{ fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '12px 16px', borderBottom: '2px solid #E5E7EB' }} className="text-left whitespace-nowrap">
                  Acres
                </th>
                <th style={{ fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '12px 16px', borderBottom: '2px solid #E5E7EB' }} className="text-left whitespace-nowrap">
                  Harvest Qty
                </th>
                <th style={{ fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '12px 16px', borderBottom: '2px solid #E5E7EB' }} className="text-left whitespace-nowrap">
                  Yield/Acre
                </th>
                <th style={{ fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '12px 16px', borderBottom: '2px solid #E5E7EB' }} className="text-left whitespace-nowrap">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredHarvests.map((harvest, index) => (
                <tr 
                  key={harvest.harvestId} 
                  style={{
                    background: index % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
                    transition: 'all 0.15s ease',
                    cursor: 'pointer'
                  }}
                  className="group hover:border-l-4"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F0FDF4';
                    e.currentTarget.style.borderLeft = '3px solid #16A34A';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = index % 2 === 0 ? '#FFFFFF' : '#F9FAFB';
                    e.currentTarget.style.borderLeft = 'none';
                  }}
                >
                  <td style={{ fontSize: '13px', color: '#374151', padding: '11px 16px' }} className="whitespace-nowrap">
                    <div>
                      <p className="font-medium whitespace-nowrap">{harvest.farmerName}</p>
                      <p className="text-xs text-gray-600 whitespace-nowrap">{harvest.farmerNIC}</p>
                    </div>
                  </td>
                  <td style={{ fontSize: '13px', color: '#374151', padding: '11px 16px' }} className="whitespace-nowrap">{harvest.farmName}</td>
                  <td style={{ fontSize: '13px', color: '#374151', padding: '11px 16px' }} className="whitespace-nowrap">{harvest.location}</td>
                  <td style={{ fontSize: '13px', color: '#374151', padding: '11px 16px' }} className="whitespace-nowrap">{harvest.season}</td>
                  <td style={{ fontSize: '13px', color: '#374151', padding: '11px 16px' }} className="whitespace-nowrap">{harvest.year}</td>
                  <td style={{ fontSize: '13px', color: '#374151', padding: '11px 16px' }} className="whitespace-nowrap">{harvest.crop}</td>
                  <td style={{ fontSize: '13px', color: '#374151', padding: '11px 16px' }} className="whitespace-nowrap">{harvest.acres}</td>
                  <td style={{ fontSize: '13px', color: '#374151', padding: '11px 16px', fontWeight: '500' }} className="whitespace-nowrap">{harvest.harvestQty} kg</td>
                  <td style={{ fontSize: '13px', color: '#374151', padding: '11px 16px', fontWeight: '500' }} className="whitespace-nowrap">{harvest.yieldPerAcre.toFixed(2)} kg</td>
                  <td style={{ fontSize: '13px', color: '#374151', padding: '11px 16px' }} className="whitespace-nowrap">
                    {new Date(harvest.harvestDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Download Format Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Download Report</h2>
              <button
                onClick={() => setShowDownloadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 text-sm mb-6">
              Choose a format to download the harvest report ({filteredHarvests.length} records)
            </p>

            <div className="space-y-3">
              <button
                onClick={handleExportCSV}
                disabled={exportingFormat === 'csv'}
                className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <File className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-800">CSV File</p>
                  <p className="text-xs text-gray-500">Comma-separated values</p>
                </div>
              </button>

              <button
                onClick={handleExportExcel}
                disabled={exportingFormat === 'excel'}
                className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <FileJson className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-800">Excel File</p>
                  <p className="text-xs text-gray-500">Microsoft Excel format (.xls)</p>
                </div>
              </button>

              <button
                onClick={handleExportPDF}
                disabled={exportingFormat === 'pdf'}
                className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <File className="w-5 h-5 text-red-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-800">PDF File</p>
                  <p className="text-xs text-gray-500">Printable document format</p>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowDownloadModal(false)}
              className="w-full mt-6 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}