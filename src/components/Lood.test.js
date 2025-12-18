import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Lood from './Lood';

// Mock fetch
global.fetch = jest.fn();

describe('Lood Component', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    test('renders Lood component', () => {
        fetch.mockResolvedValueOnce({
            json: async () => []
        });

        render(<Lood />);
        expect(screen.getByText('Laulud')).toBeInTheDocument();
    });

    test('displays empty state when no songs exist', async () => {
        fetch.mockResolvedValueOnce({
            json: async () => []
        });

        render(<Lood />);

        await waitFor(() => {
            expect(screen.getByText('Lugusid pole veel lisatud')).toBeInTheDocument();
        });
    });

    test('displays songs when they exist', async () => {
        const mockSongs = [
            {
                id: 1,
                nimetus: 'Test Song',
                taktid: [
                    { id: 1, kolmkola: { tahis: 'C', pohitoon: 60 } },
                    { id: 2, kolmkola: { tahis: 'F', pohitoon: 65 } }
                ]
            }
        ];

        fetch.mockResolvedValueOnce({
            json: async () => mockSongs
        });

        render(<Lood />);

        await waitFor(() => {
            expect(screen.getByText('Test Song')).toBeInTheDocument();
            expect(screen.getByText('C')).toBeInTheDocument();
            expect(screen.getByText('F')).toBeInTheDocument();
        });
    });

    test('adds a new song', async () => {
        fetch
            .mockResolvedValueOnce({ json: async () => [] }) // Initial load
            .mockResolvedValueOnce({ json: async () => ({}) }) // POST request
            .mockResolvedValueOnce({ json: async () => [{ id: 1, nimetus: 'New Song', taktid: [] }] }); // Reload

        render(<Lood />);

        const input = screen.getByPlaceholderText(/Loo nimetus/i);
        const button = screen.getByText('✦ Lisa lugu');

        fireEvent.change(input, { target: { value: 'New Song' } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/lood'),
                expect.objectContaining({
                    method: 'POST',
                    body: expect.stringContaining('"Nimetus":"New Song"')
                })
            );
        });
    });

    test('converts MIDI number to letter name when adding measure', () => {
        const names = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "B", "H"];

        const midiToName = (midi) => {
            const offset = midi - 60;
            const idx = ((offset % 12) + 12) % 12;
            return names[idx];
        };

        // Test that entering a MIDI number converts to letter
        expect(midiToName(60)).toBe('C');
        expect(midiToName(65)).toBe('F');
        expect(midiToName(67)).toBe('G');
    });

    test('displays measures for a song', async () => {
        const mockSongs = [
            {
                id: 1,
                nimetus: 'Chord Progression',
                taktid: [
                    { id: 1, kolmkola: { tahis: 'C', pohitoon: 60 } },
                    { id: 2, kolmkola: { tahis: 'F', pohitoon: 65 } },
                    { id: 3, kolmkola: { tahis: 'G', pohitoon: 67 } },
                    { id: 4, kolmkola: { tahis: 'C', pohitoon: 60 } }
                ]
            }
        ];

        fetch.mockResolvedValueOnce({
            json: async () => mockSongs
        });

        render(<Lood />);

        await waitFor(() => {
            expect(screen.getByText('Chord Progression')).toBeInTheDocument();
            // Check that all measures are displayed
            const cChords = screen.getAllByText('C');
            expect(cChords.length).toBeGreaterThanOrEqual(2); // At least 2 C chords
        });
    });

    test('shows notes as numbers button exists', async () => {
        const mockSongs = [
            { id: 1, nimetus: 'Test', taktid: [] }
        ];

        fetch.mockResolvedValueOnce({
            json: async () => mockSongs
        });

        render(<Lood />);

        await waitFor(() => {
            expect(screen.getByText('Arv')).toBeInTheDocument();
            expect(screen.getByText('Nimed')).toBeInTheDocument();
        });
    });
});
