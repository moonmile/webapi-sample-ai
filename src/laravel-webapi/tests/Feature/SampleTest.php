<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class SampleTest extends TestCase
{
    /**
     * A basic feature test example.
     */
    public function test_example(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }


    /**
     * 商品ID取得のテスト
     */
    public function testGetProductById(): void
    {
        $response = $this->get('/api/products/1');
        $response->assertStatus(200);
        $response->assertJsonFragment(['id' => 1]);
        $response->assertJsonFragment(['name' => 'まぐろ']);
    }

    /**
     * 商品ID取得の例外テスト
     */
    public function testGetProductByIdNotFound(): void
    {
        $response = $this->get('/api/products/9999');
        $response->assertStatus(404);
    }

    /**
     * ログイン認証に失敗した場合のテスト
     */
    public function testUnauthorizedAccess(): void
    {
        $response = $this->post('/api/login', [
            'email' => 'test@example.com',
            'password' => 'xxxxxxxx',
        ]);
        $response->assertStatus(401);
    }

    /**
     * ログイン認証が必要なエンドポイントへアクセス
     */
    public function testForbiddenAccess(): void
    {
        $response = $this->get('/api/orders');
        $response->assertStatus(302);
    }
}


