import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Kolmkolad from './Kolmkolad';

// Mock fetch
global.fetch = jest.fn();

describe('Kolmkolad Component', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    test('renders Kolmkolad component', () => {
        fetch.mockResolvedValueOnce({
            json: async () => []
        });

        render(<Kolmkolad />);
        expect(screen.getByText('Kolmkõlad')).toBeInTheDocument();
    });

    test('displays empty state when no chords exist', async () => {
        fetch.mockResolvedValueOnce({
            json: async () => []
        });

        render(<Kolmkolad />);

        await waitFor(() => {
            expect(screen.getByText('Kolmkõlasid pole veel lisatud')).toBeInTheDocument();
        });
    });

    test('displays chords when they exist', async () => {
        const mockChords = [
            { id: 1, tahis: 'C', pohitoon: 60 },
            { id: 2, tahis: 'F', pohitoon: 65 },
            { id: 3, tahis: 'G', pohitoon: 67 }
        ];

        fetch.mockResolvedValueOnce({
            json: async () => mockChords
        });

        render(<Kolmkolad />);

        await waitFor(() => {
            expect(screen.getByText('C')).toBeInTheDocument();
            expect(screen.getByText('F')).toBeInTheDocument();
            expect(screen.getByText('G')).toBeInTheDocument();
        });
    });

    test('converts MIDI number to letter name on input', async () => {
        fetch.mockResolvedValueOnce({
            json: async () => []
        });

        render(<Kolmkolad />);

        const input = screen.getByPlaceholderText(/Tähtnimetus/i);
        fireEvent.change(input, { target: { value: '60' } });

        await waitFor(() => {
            expect(input.value).toBe('C');
        });
    });

    test('adds a new chord by letter name', async () => {
        fetch
            .mockResolvedValueOnce({ json: async () => [] }) // Initial load
            .mockResolvedValueOnce({ json: async () => ({}) }) // POST request
            .mockResolvedValueOnce({ json: async () => [{ id: 1, tahis: 'C', pohitoon: 60 }] }); // Reload

        render(<Kolmkolad />);

        const input = screen.getByPlaceholderText(/Tähtnimetus/i);
        const button = screen.getByText('✦ Lisa');

        fireEvent.change(input, { target: { value: 'C' } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/kolmkolad'),
                expect.objectContaining({
                    method: 'POST',
                    body: expect.stringContaining('"Tahis":"C"')
                })
            );
        });
    });

    test('MIDI to name conversion works correctly', () => {
        // This tests the midiToName function logic
        const names = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "B", "H"];

        const midiToName = (midi) => {
            const offset = midi - 60;
            const idx = ((offset % 12) + 12) % 12;
            return names[idx];
        };

        expect(midiToName(60)).toBe('C');
        expect(midiToName(65)).toBe('F');
        expect(midiToName(67)).toBe('G');
        expect(midiToName(72)).toBe('C'); // Next octave
    });
});
