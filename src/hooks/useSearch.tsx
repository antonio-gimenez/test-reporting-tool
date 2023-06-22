import React, { useState, useEffect, useCallback } from 'react';
import useDebounce from './useDebounce';

interface SearchResults {
    searchTerm: string | number | null;
    searchResults: any;
    handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
    isSearching: boolean | null;
    resetSearch: () => void;
}

function useSearch(data: any = [], depth: number = 0, searchProp?: string | number): SearchResults {
    const [searchTerm, setSearchTerm] = useState<string | number | null>(null);
    const [searchResults, setSearchResults] = useState<any | null>(null);
    const [isSearching, setSearching] = useState<boolean | null>(!searchTerm || null);

    const deepSearch = useCallback(
        // We use an internal search function to avoid passing the visited set around as an argument in recursion (which would cause unnecessary re-renders)
        (obj: any, term: string | number, visited = new Set(), currentDepth = 0): boolean => {
            if (visited.has(obj)) {
                return false; // Circular reference detected, exit recursion
            }
            // Add the object to the visited set
            visited.add(obj);

            // Iterate over the object keys
            for (const key in obj) {
                const value = obj[key];
                // If the value is an object or array, recursively search again (incrementing the depth)
                if (typeof value === 'object' && value !== null && currentDepth < (depth ?? 2)) {
                    if (Array.isArray(value)) {
                        for (const item of value) {
                            // If the item is an object, recursively search again (incrementing the depth)
                            if (typeof item === 'object' && item !== null) {
                                if (deepSearch(item, term, visited, currentDepth + 1)) {
                                    // If the deep search finds a match, return true
                                    return true;
                                }
                            } else if (String(item).toLowerCase().includes(String(term).toLowerCase())) {
                                // If the item is a string and matches the search term, return true
                                return true;
                            }
                        }
                    } else {
                        if (deepSearch(value, term, visited, currentDepth + 1)) {
                            return true;
                        }
                    }
                } else if (String(value).toLowerCase().includes(String(term).toLowerCase())) {
                    return true;
                }
            }

            visited.delete(obj);
            return false;
        },
        [depth]
    );

    const search = useCallback(
        (term: string | number | null) => {
            // If no data, return an empty array
            if (!term) {
                return [];
            }
            // If term is a number, convert it to a string
            if (typeof term === 'number') {
                term = term.toString();
            }

            return data.filter((item: any) =>
                searchProp
                    ? deepSearch(item.company, term ?? '')
                    : Object.values(item).some(
                        (value) =>
                            String(value).toLowerCase().includes(String(term).toLowerCase()) ||
                            (typeof value === 'object' && deepSearch(value, term ?? ''))
                    )
            );
        },
        [data, searchProp, deepSearch]
    );

    // Use the useDebounce hook to debounce the handleSearch function
    const debouncedHandleSearch = useDebounce((value: string) => {
        if (!value) {
            // If the search value is empty, return the entire data set (no filter)
            setSearchResults(null);
            setSearchTerm(null);
        } else {
            // Otherwise, return the search results
            setSearchTerm(value);
        }
    }, 400);

    function handleSearch(event: React.ChangeEvent<HTMLInputElement>) {
        const { value } = event.target;
        debouncedHandleSearch(value);
    }

    // Reset the search results and search term
    function resetSearch() {
        setSearchResults(null);
        setSearchTerm(null);
        setSearching(false);
    }

    useEffect(() => {
        // If there is no search term, return early
        setSearching(!!searchTerm);
        // If there is no data, return early
        setSearchResults(search(searchTerm));
    }, [searchTerm, search, data, searchProp]);

    return {
        searchTerm,
        searchResults,
        handleSearch,
        isSearching,
        resetSearch,
    };
}

export default useSearch;
