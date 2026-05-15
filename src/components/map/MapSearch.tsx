import { FormEvent, useMemo, useState } from 'react';
import { searchLocations } from '../../utils/geo/search-api';
import { SearchResult } from '../../utils/geo/types';

interface MapSearchProps {
    onSelect: (result: SearchResult) => void;
}

export default function MapSearch({ onSelect }: MapSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [message, setMessage] = useState('Try “Broadway”, “C6-4”, or BBL 1000477501.');

    const resultCountLabel = useMemo(() => {
        if (isSearching) return 'Searching…';
        if (!query.trim()) return message;
        return results.length ? `${results.length} result${results.length === 1 ? '' : 's'} found` : message;
    }, [isSearching, message, query, results.length]);

    async function runSearch(event?: FormEvent<HTMLFormElement>) {
        event?.preventDefault();
        const trimmed = query.trim();
        if (!trimmed) {
            setResults([]);
            setMessage('Enter an address, zoning district, or 10-digit BBL.');
            return;
        }
        setIsSearching(true);
        const nextResults = await searchLocations(trimmed);
        setResults(nextResults);
        setMessage(nextResults.length ? 'Select a result to zoom the map.' : 'No matching parcels or zoning districts were found.');
        setIsSearching(false);
    }

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <form className="flex gap-2" onSubmit={runSearch}>
                <label className="sr-only" htmlFor="map-search">
                    Search by address, BBL, or zoning district
                </label>
                <input
                    id="map-search"
                    className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Address, BBL, or district"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                />
                <button
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                    type="submit"
                    disabled={isSearching}
                >
                    Search
                </button>
            </form>
            <p className="mt-2 text-xs text-slate-500" aria-live="polite">
                {resultCountLabel}
            </p>
            {results.length > 0 && (
                <div className="mt-3 max-h-72 overflow-y-auto rounded-xl border border-slate-100">
                    {results.map((result) => (
                        <button
                            key={`${result.type}-${result.id}`}
                            type="button"
                            className="block w-full border-b border-slate-100 px-3 py-3 text-left last:border-b-0 hover:bg-blue-50"
                            onClick={() => onSelect(result)}
                        >
                            <span className="block text-sm font-semibold text-slate-950">{result.label}</span>
                            <span className="mt-1 block text-xs text-slate-600">{result.description}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
