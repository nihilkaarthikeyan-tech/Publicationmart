<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

/**
 * Guards against the class of bug that let the app diverge from its own
 * migrations: columns and tables were added straight to the live database, so
 * a fresh `migrate` produced a schema the code crashed against.
 *
 * If someone adds a model or writes to a new column without a migration, one
 * of these fails.
 */
class SchemaIntegrityTest extends TestCase
{
    use RefreshDatabase;

    /** Every model's table must be created by the migrations. */
    public function test_every_model_has_a_table(): void
    {
        $missing = [];

        foreach (glob(app_path('Models/*.php')) as $file) {
            $class = 'App\\Models\\' . basename($file, '.php');
            if (!class_exists($class)) {
                continue;
            }
            $model = new $class;
            if (!$model instanceof \Illuminate\Database\Eloquent\Model) {
                continue;
            }
            if (!Schema::hasTable($model->getTable())) {
                $missing[] = class_basename($class) . ' -> ' . $model->getTable();
            }
        }

        $this->assertSame([], $missing, "Models without a migrated table:\n" . implode("\n", $missing));
    }

    /**
     * Columns the application writes to that have historically drifted. These
     * exist in production; the migrations must create them too.
     */
    public function test_known_drifted_columns_are_migrated(): void
    {
        $required = [
            'blogs' => ['image_path', 'is_presale', 'access_attempts'],
            'users' => ['campaign_code_id'],
        ];

        foreach ($required as $table => $columns) {
            foreach ($columns as $column) {
                $this->assertTrue(
                    Schema::hasColumn($table, $column),
                    "Missing column {$table}.{$column} — the code writes to it but no migration creates it."
                );
            }
        }
    }

    /** Tables that were added directly to production must now be migrated. */
    public function test_previously_untracked_tables_exist(): void
    {
        foreach (['campaign_codes', 'presale_bookings', 'support_tickets', 'support_ticket_replies'] as $table) {
            $this->assertTrue(Schema::hasTable($table), "Missing table: {$table}");
        }
    }

    /** A model's $fillable must only reference columns that exist. */
    public function test_fillable_fields_exist_as_columns(): void
    {
        $problems = [];

        foreach (glob(app_path('Models/*.php')) as $file) {
            $class = 'App\\Models\\' . basename($file, '.php');
            if (!class_exists($class)) {
                continue;
            }
            $model = new $class;
            if (!$model instanceof \Illuminate\Database\Eloquent\Model) {
                continue;
            }
            $table = $model->getTable();
            if (!Schema::hasTable($table)) {
                continue;
            }
            foreach ($model->getFillable() as $field) {
                if (!Schema::hasColumn($table, $field)) {
                    $problems[] = class_basename($class) . ": {$table}.{$field}";
                }
            }
        }

        $this->assertSame([], $problems, "Fillable fields with no matching column:\n" . implode("\n", $problems));
    }
}
