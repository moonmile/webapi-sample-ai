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
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('rating');
            $table->text('comment');
            $table->integer('product_id')->nullable();
            $table->integer('order_id')->nullable();
            $table->integer('seat_id')->nullable();
            $table->timestamps();

            $table->index('product_id', 'idx_reviews_product_id');
            $table->index('order_id', 'idx_reviews_order_id');
            $table->index('seat_id', 'idx_reviews_seat_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
