<?php

namespace Tests\Feature;

use Tests\TestCase;

class HelloTest extends TestCase
{
    public function test_hello_endpoint_returns_message_and_now(): void
    {
        $response = $this->get('/api/hello');

        $response->assertOk()
                 ->assertJsonStructure(['message', 'now'])
                 ->assertJson(['message' => 'Hello, World!']);

        // Basic ISO8601 check (contains 'T' and timezone offset or Z)
        $now = $response->json('now');
        $this->assertIsString($now);
        $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}T[^\s]+$/', $now);
    }
}

