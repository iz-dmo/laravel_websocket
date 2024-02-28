<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ApiController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/user-login',[ApiController::class,'Login']);
Route::post('/user-register',[ApiController::class,'Register']);


Route::group(['middleware' => ['auth:api']],function(){
    Route::get('/users',[ApiController::class,'UserList']);
    Route::post('/send-messages',[ApiController::class,'SendMessage']);
    Route::get('/old-messages',[ApiController::class,'OldMessage']);
    Route::delete('/delete-messages/{id}',[ApiController::class,'DeleteMessage']);
    Route::put('/edit-messages/{id}',[ApiController::class,'EditMessage']);

});