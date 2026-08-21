<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Helper function to safely add an index
     */
    private function safeAddIndex($table, $columns, $indexName): void
    {
        try {
            Schema::table($table, function (Blueprint $t) use ($columns, $indexName) {
                $t->index($columns, $indexName);
            });
        } catch (\Exception $e) {
            // Index might already exist, ignore
        }
    }

    /**
     * Helper function to safely drop an index
     */
    private function safeDropIndex($table, $indexName): void
    {
        try {
            Schema::table($table, function (Blueprint $t) use ($indexName) {
                $t->dropIndex($indexName);
            });
        } catch (\Exception $e) {
            // Index might not exist, ignore
        }
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add indexes to books table
        if (Schema::hasTable('books')) {
            $this->safeAddIndex('books', 'user_id', 'idx_books_user_id');
            $this->safeAddIndex('books', 'step_completed', 'idx_books_step_completed');
            $this->safeAddIndex('books', 'created_at', 'idx_books_created_at');
            $this->safeAddIndex('books', ['user_id', 'step_completed'], 'idx_books_user_step');
        }

        // Add indexes to transactions table
        if (Schema::hasTable('transactions')) {
            $this->safeAddIndex('transactions', 'book_id', 'idx_transactions_book_id');
            $this->safeAddIndex('transactions', 'author_id', 'idx_transactions_author_id');
            $this->safeAddIndex('transactions', 'payment_status', 'idx_transactions_payment_status');
            $this->safeAddIndex('transactions', 'created_at', 'idx_transactions_created_at');
            if (Schema::hasColumn('transactions', 'sales_channel')) {
                $this->safeAddIndex('transactions', 'sales_channel', 'idx_transactions_sales_channel');
            }
            $this->safeAddIndex('transactions', ['author_id', 'payment_status'], 'idx_transactions_author_status');
        }

        // Add indexes to users table
        if (Schema::hasTable('users')) {
            if (Schema::hasColumn('users', 'referral_code')) {
                $this->safeAddIndex('users', 'referral_code', 'idx_users_referral_code');
            }
            if (Schema::hasColumn('users', 'referrer_id')) {
                $this->safeAddIndex('users', 'referrer_id', 'idx_users_referrer_id');
            }
            if (Schema::hasColumn('users', 'is_admin')) {
                $this->safeAddIndex('users', 'is_admin', 'idx_users_is_admin');
            }
            if (Schema::hasColumn('users', 'campaign_code_id')) {
                $this->safeAddIndex('users', 'campaign_code_id', 'idx_users_campaign_code_id');
            }
        }

        // Add indexes to campaign_codes table
        if (Schema::hasTable('campaign_codes')) {
            $this->safeAddIndex('campaign_codes', 'code', 'idx_campaign_codes_code');
            $this->safeAddIndex('campaign_codes', 'is_active', 'idx_campaign_codes_is_active');
            $this->safeAddIndex('campaign_codes', ['code', 'is_active'], 'idx_campaign_codes_code_active');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('books')) {
            $this->safeDropIndex('books', 'idx_books_user_id');
            $this->safeDropIndex('books', 'idx_books_step_completed');
            $this->safeDropIndex('books', 'idx_books_created_at');
            $this->safeDropIndex('books', 'idx_books_user_step');
        }

        if (Schema::hasTable('transactions')) {
            $this->safeDropIndex('transactions', 'idx_transactions_book_id');
            $this->safeDropIndex('transactions', 'idx_transactions_author_id');
            $this->safeDropIndex('transactions', 'idx_transactions_payment_status');
            $this->safeDropIndex('transactions', 'idx_transactions_created_at');
            $this->safeDropIndex('transactions', 'idx_transactions_sales_channel');
            $this->safeDropIndex('transactions', 'idx_transactions_author_status');
        }

        if (Schema::hasTable('users')) {
            $this->safeDropIndex('users', 'idx_users_referral_code');
            $this->safeDropIndex('users', 'idx_users_referrer_id');
            $this->safeDropIndex('users', 'idx_users_is_admin');
            $this->safeDropIndex('users', 'idx_users_campaign_code_id');
        }

        if (Schema::hasTable('campaign_codes')) {
            $this->safeDropIndex('campaign_codes', 'idx_campaign_codes_code');
            $this->safeDropIndex('campaign_codes', 'idx_campaign_codes_is_active');
            $this->safeDropIndex('campaign_codes', 'idx_campaign_codes_code_active');
        }
    }
};
