<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class Api2PdfService
{
    protected $apiKey;
    protected $apiHost;

    public function __construct()
    {
        $this->apiKey = config('services.api2pdf.key');
        $this->apiHost = config('services.api2pdf.host');
    }

    /**
     * Convert raw HTML string to PDF using Chrome engine (best quality).
     *
     * @param string $html  The full HTML content to convert
     * @param array $options  Optional settings like margins, page size, etc.
     * @return array  ['success' => bool, 'pdf_url' => string|null, 'error' => string|null]
     */
    public function htmlToPdf(string $html, array $options = []): array
    {
        try {
            // Default options for book-quality PDF
            $defaultOptions = [
                'marginTop' => 0,
                'marginBottom' => 0,
                'marginLeft' => 0,
                'marginRight' => 0,
                'printBackground' => true,
                'preferCSSPageSize' => true,
            ];

            $mergedOptions = array_merge($defaultOptions, $options);

            $response = Http::withHeaders([
                'X-RapidAPI-Key' => $this->apiKey,
                'X-RapidAPI-Host' => $this->apiHost,
                'Content-Type' => 'application/json',
            ])->post("https://{$this->apiHost}/chrome/html", [
                'html' => $html,
                'inlinePdf' => true,
                'options' => $mergedOptions,
            ]);

            $result = $response->json();

            if ($response->successful() && (isset($result['FileUrl']) || isset($result['pdf']))) {
                return [
                    'success' => true,
                    'pdf_url' => $result['FileUrl'] ?? $result['pdf'],
                    'error' => null,
                ];
            }

            Log::error('Api2Pdf Error', ['response' => $result]);
            return [
                'success' => false,
                'pdf_url' => null,
                'error' => $result['error'] ?? ($result['Error'] ?? 'Unknown error from Api2Pdf'),
            ];

        }
        catch (\Exception $e) {
            Log::error('Api2Pdf Exception: ' . $e->getMessage());
            return [
                'success' => false,
                'pdf_url' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Convert a publicly accessible URL to PDF.
     *
     * @param string $url  The public URL to convert
     * @param array $options  Optional settings
     * @return array
     */
    public function urlToPdf(string $url, array $options = []): array
    {
        try {
            $defaultOptions = [
                'marginTop' => 0,
                'marginBottom' => 0,
                'marginLeft' => 0,
                'marginRight' => 0,
                'printBackground' => true,
                'preferCSSPageSize' => true,
            ];

            $mergedOptions = array_merge($defaultOptions, $options);

            $response = Http::withHeaders([
                'X-RapidAPI-Key' => $this->apiKey,
                'X-RapidAPI-Host' => $this->apiHost,
                'Content-Type' => 'application/json',
            ])->post("https://{$this->apiHost}/chrome/url", [
                'url' => $url,
                'inlinePdf' => true,
                'options' => $mergedOptions,
            ]);

            $result = $response->json();

            if ($response->successful() && (isset($result['FileUrl']) || isset($result['pdf']))) {
                return [
                    'success' => true,
                    'pdf_url' => $result['FileUrl'] ?? $result['pdf'],
                    'error' => null,
                ];
            }

            Log::error('Api2Pdf URL Error', ['response' => $result]);
            return [
                'success' => false,
                'pdf_url' => null,
                'error' => $result['error'] ?? ($result['Error'] ?? 'Unknown error from Api2Pdf'),
            ];

        }
        catch (\Exception $e) {
            Log::error('Api2Pdf URL Exception: ' . $e->getMessage());
            return [
                'success' => false,
                'pdf_url' => null,
                'error' => $e->getMessage(),
            ];
        }
    }
}
