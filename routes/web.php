<?php

use App\Models\RequestMessage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProfileController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

// Route::get('/dashboard', function () {
//     return view('dashboard');
// })->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/dashboard',[UserController::class,'UserList'])->middleware(['auth','verified'])->name('dashboard');
Route::post('chat-messages',[UserController::class,'Message'])->name('chat-messages');
Route::get('load-messages',[UserController::class,'Loading'])->name('load-messages');
Route::post('delete-messages',[UserController::class,'Delete'])->name('delete-messages');
Route::post('edit-messages',[UserController::class,'Edit'])->name('edit-messages');

// request message
Route::post('request-messages',[UserController::class,'MessageRequest'])->name('request-messages');
Route::get('request-old-messages',[UserController::class,'LoadingRequest'])->name('request-old-messages');
Route::post('delete-request-messages',[UserController::class,'DeleteRequest'])->name('delete-request-messages');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
