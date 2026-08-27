<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class StockImageController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->input('query');
        $page = $request->input('page', 1);
        $perPage = $request->input('per_page', 20);

        if (!$query) {
            return response()->json(['photos' => []]);
        }

        // Via config() so it survives `php artisan config:cache`.
        $apiKey = config('services.pexels.key');

        if (!$apiKey) {
            return response()->json(['error' => 'API Key not configured'], 500);
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => $apiKey
            ])->get('https://api.pexels.com/v1/search', [
                        'query' => $query,
                        'per_page' => $perPage,
                        'page' => $page,
                        'orientation' => 'portrait'
                    ]);

            if ($response->successful()) {
                return $response->json();
            } else {
                return response()->json([
                    'error' => 'Pexels API Error',
                    'details' => $response->body()
                ], $response->status());
            }

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server Error',
                'message' => 'Could not fetch images.'
            ], 500);
        }
    }
}
