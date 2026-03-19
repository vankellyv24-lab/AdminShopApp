<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        if (!$request->user()->hasPermission('activity_logs.view')) {
            abort(403);
        }

        $query = ActivityLog::query()
            ->with('user')
            ->orderByDesc('created_at');

        if ($request->filled('action')) {
            $query->where('action', $request->input('action'));
        }

        if ($request->filled('entity_type')) {
            $query->where('entity_type', $request->input('entity_type'));
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->input('user_id'));
        }

        $logs = $query->paginate(50)->withQueryString();

        // Get distinct actions and entity types for filters
        $actions = ActivityLog::query()->distinct()->pluck('action');
        $entityTypes = ActivityLog::query()->distinct()->pluck('entity_type');

        return Inertia::render('Admin/ActivityLogs/Index', [
            'logs' => $logs,
            'filters' => [
                'action' => $request->input('action'),
                'entity_type' => $request->input('entity_type'),
                'user_id' => $request->input('user_id'),
            ],
            'actions' => $actions,
            'entityTypes' => $entityTypes,
        ]);
    }
}
