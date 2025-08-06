<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('product_categories', function (Blueprint $table) {
            $table->integer('product_id');
            $table->integer('category_id');

            // 複合主キー
            $table->primary(['product_id', 'category_id']);

            // インデックス
            $table->index('product_id', 'idx_product_id');
            $table->index('category_id', 'idx_category_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_categories');
    }
};
