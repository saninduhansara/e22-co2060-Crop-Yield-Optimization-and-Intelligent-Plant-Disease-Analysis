interface AdminReportFiltersProps {
  selectedYear: string;
  selectedSeason: string;
  selectedCrop: string | null;
  years: string[];
  seasons: string[];
  availableCrops: string[];
  defaultCropOptions: string[];
  onYearChange: (value: string) => void;
  onSeasonChange: (value: string) => void;
  onCropChange: (value: string | null) => void;
}

export function AdminReportFilters({
  selectedYear,
  selectedSeason,
  selectedCrop,
  years,
  seasons,
  availableCrops,
  defaultCropOptions,
  onYearChange,
  onSeasonChange,
  onCropChange,
}: AdminReportFiltersProps) {
  const allCrops = Array.from(new Set([...defaultCropOptions, ...availableCrops]));

  return (
    <div
      style={{
        background: '#F9FAFB',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '20px',
      }}
    >
      {/* Dropdowns Row */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* Year Select */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#6B7280', marginBottom: '4px' }}>Year</label>
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
            style={{
              padding: '10px 14px',
              background: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#111827',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <option value="">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Season Select */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#6B7280', marginBottom: '4px' }}>Season</label>
          <select
            value={selectedSeason}
            onChange={(e) => onSeasonChange(e.target.value)}
            style={{
              padding: '10px 14px',
              background: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#111827',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <option value="">All Seasons</option>
            {seasons.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Crop Select */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#6B7280', marginBottom: '4px' }}>Crop</label>
          <select
            value={selectedCrop || ''}
            onChange={(e) => onCropChange(e.target.value || null)}
            style={{
              padding: '10px 14px',
              background: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#111827',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <option value="">All Crops</option>
            {allCrops.map((crop) => (
              <option key={crop} value={crop}>
                {crop}
              </option>
            ))}
          </select>
        </div>

        {/* End of filters */}
      </div>
    </div>
  );
}
