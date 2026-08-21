<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class AdminCertificateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $certificates = Certificate::latest()->get();
        return Inertia::render('Admin/Certificates/Index', [
            'certificates' => $certificates
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'recipient_name' => 'required|string',
            'certificate_name' => 'required|string',
            // Laravel 'max' is in KB → 1 GB = 1,048,576 KB
            'file' => 'required|file|mimes:pdf,jpg,png,jpeg|max:1048576',
        ]);

        $path = $request->file('file')->store('certificates', 'public');

        Certificate::create([
            'email' => $request->email,
            'recipient_name' => $request->recipient_name,
            'certificate_name' => $request->certificate_name,
            'file_path' => $path,
            // user_id is null initially
        ]);

        return redirect()->back()->with('success', 'Certificate issued successfully!');
    }

    public function destroy(Certificate $certificate)
    {
        if ($certificate->file_path) {
            Storage::disk('public')->delete($certificate->file_path);
        }
        $certificate->delete();
        return redirect()->back()->with('success', 'Certificate deleted.');
    }
}
