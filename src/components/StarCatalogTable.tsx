// ============================================================
// StarCatalogTable — Sortable, filterable table of 60 stars
// Filter by spectral type, show colored spectral badges
// ============================================================

import { useState, useMemo, memo } from 'react';

interface Star {
  name: string;
  spectral_type: string;
  distance_ly: number;
  mass_solar: number;
  notes: string;
}

const SPECTRAL_FILTERS = ['All', 'O/B', 'A', 'F', 'G', 'K', 'M', 'L/T/Y', 'WD'] as const;
type SpectralFilter = (typeof SPECTRAL_FILTERS)[number];

function getSpectralClass(type: string): SpectralFilter {
  const t = type.trim();
  if (t.startsWith('O') || t.startsWith('B')) return 'O/B';
  if (t.startsWith('A')) return 'A';
  if (t.startsWith('F')) return 'F';
  if (t.startsWith('G')) return 'G';
  if (t.startsWith('K')) return 'K';
  if (t.startsWith('M')) return 'M';
  if (t.startsWith('L') || t.startsWith('T') || t.startsWith('Y')) return 'L/T/Y';
  if (t.startsWith('D')) return 'WD';
  return 'All';
}

function getSpectralColor(filter: SpectralFilter): string {
  switch (filter) {
    case 'O/B': return '#5a7cff';
    case 'A': return '#8aa4ff';
    case 'F': return '#fff5e0';
    case 'G': return '#ffe88a';
    case 'K': return '#ffaa44';
    case 'M': return '#ff6622';
    case 'L/T/Y': return '#441100';
    case 'WD': return '#c0d8ff';
    default: return '#8aa4ff';
  }
}

interface StarCatalogTableProps {
  stars: Star[];
  className?: string;
}

const StarCatalogTable = memo(function StarCatalogTable({ stars, className = '' }: StarCatalogTableProps) {
  const [activeFilter, setActiveFilter] = useState<SpectralFilter>('All');
  const [sortBy, setSortBy] = useState<'name' | 'distance' | 'mass'>('distance');

  const filteredStars = useMemo(() => {
    let result = activeFilter === 'All'
      ? [...stars]
      : stars.filter((s) => getSpectralClass(s.spectral_type) === activeFilter);

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'mass': return a.mass_solar - b.mass_solar;
        case 'distance':
        default: return a.distance_ly - b.distance_ly;
      }
    });

    return result;
  }, [stars, activeFilter, sortBy]);

  return (
    <div className={className}>
      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {SPECTRAL_FILTERS.map((filter) => {
          const isActive = activeFilter === filter;
          const color = filter === 'All' ? '#5f7e7d' : getSpectralColor(filter);
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className="transition-all duration-200"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase' as const,
                padding: '4px 12px',
                borderRadius: '4px',
                border: `1px solid ${isActive ? color : 'rgba(95, 126, 125, 0.2)'}`,
                background: isActive ? `${color}15` : 'transparent',
                color: isActive ? color : '#5f7e7d',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = `${color}60`;
                  e.currentTarget.style.color = color;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'rgba(95, 126, 125, 0.2)';
                  e.currentTarget.style.color = '#5f7e7d';
                }
              }}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* Sort controls */}
      <div className="flex gap-4 mb-4 justify-center">
        {([['distance', 'Distance'], ['name', 'Name'], ['mass', 'Mass']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSortBy(key)}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.06em',
              textTransform: 'uppercase' as const,
              color: sortBy === key ? '#46e0d2' : '#5f7e7d',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderBottom: `1px solid ${sortBy === key ? '#46e0d2' : 'transparent'}`,
              paddingBottom: '2px',
              transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div
        style={{
          overflowX: 'auto',
          borderRadius: '8px',
          border: '1px solid rgba(70, 224, 210, 0.08)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr
              style={{
                borderBottom: '2px solid rgba(70, 224, 210, 0.18)',
              }}
            >
              {['#', 'Name', 'Type', 'Dist (ly)', 'Mass (M☉)', 'Notes'].map((h) => (
                <th
                  key={h}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#5f7e7d',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    padding: '10px 12px',
                    textAlign: h === 'Name' || h === 'Notes' ? 'left' : 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredStars.map((star, idx) => {
              const sClass = getSpectralClass(star.spectral_type);
              const sColor = getSpectralColor(sClass);
              return (
                <tr
                  key={star.name}
                  className="star-table-row"
                  style={{
                    borderBottom: '1px solid rgba(95, 126, 125, 0.1)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(70, 224, 210, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11,
                      color: '#5f7e7d',
                      padding: '10px 12px',
                      textAlign: 'center',
                      width: 40,
                    }}
                  >
                    {idx + 1}
                  </td>
                  <td
                    style={{
                      fontFamily: "'Space Grotesk', system-ui, sans-serif",
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#cfe7e6',
                      padding: '10px 12px',
                    }}
                  >
                    {star.name}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: `${sColor}15`,
                        color: sColor,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {star.spectral_type}
                    </span>
                  </td>
                  <td
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 12,
                      color: '#cfe7e6',
                      padding: '10px 12px',
                      textAlign: 'right',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {star.distance_ly.toFixed(2)}
                  </td>
                  <td
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 12,
                      color: '#cfe7e6',
                      padding: '10px 12px',
                      textAlign: 'right',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {star.mass_solar.toFixed(3)}
                  </td>
                  <td
                    style={{
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: 12,
                      fontStyle: 'italic',
                      color: '#5f7e7d',
                      padding: '10px 12px',
                    }}
                  >
                    {star.notes}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        style={{
          textAlign: 'center',
          marginTop: 12,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: '#5f7e7d',
        }}
      >
        Showing {filteredStars.length} of {stars.length} stars
      </div>
    </div>
  );
});

export default StarCatalogTable;
