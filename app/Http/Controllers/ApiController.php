<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\User;
use App\Events\MessageEvent;
use Illuminate\Http\Request;
use App\Events\MessageEditEvent;
use App\Events\MessageDeleteEvent;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;


class ApiController extends Controller
{


    // - login 
    public function Login(Request $request)
    {
        $data = $request->all();
        $validate = Validator::make($data, [
            'email' => 'required|email',
            'password' => 'required',
        ]);
        if($validate->fails()){
            return response()->json(['error' => $validate->errors()->all()],422);
        }
        if(Auth::attempt(['email'=> $data['email'],'password'=> $data['password']])){
            $user = Auth::user();
            $token = $user->createToken('Token')->accessToken;
            return response()->json(['token'=> $token],200);
        }
    }

    //- Register
    public function Register(Request $request)
    {
        $user = User::create([
            'name' => $request->name,
            "email" => $request->email,
            "password" =>  Hash::make($request->password)
        ]);
        $user = Auth::user();
        $token = $user->createToken('Token')->accessToken;
        return response()->json(['token'=> $token],200);
    }

    public function UserList()
    {
        $users = User::whereNotIn('id',[auth()->user()->id])->get();
        return response()->json(['users' => $users],200);
    }

    // new message
    public function SendMessage(Request $request)
    {
        try {
            $chat = Chat::create([
                'sender_id' => Auth::id(),
                'receiver_id' => $request->receiver_id,
                'message' => $request->message,
            ]);

            event (new MessageEvent($chat));
            return response()->json(['success' => true, 'data' => $chat],201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'msg' => $e->getMessage()],500);
        }
    }

    // old message-data
    public function OldMessage(Request $request)
    {
        try {
            $sender_id = Auth::id();
            $filter_chat = Chat::where(function($query) use ($sender_id,$request){
                $query->where('sender_id','=', $sender_id)
                ->orWhere('sender_id','=',$request->receiver_id);
            })->where(function($query) use ($sender_id,$request){
                $query->where('receiver_id','=',$request->receiver_id)
                ->orWhere('receiver_id','=',$sender_id);
            })->get();

            return response()->json(['success' => true, 'data' => $filter_chat],200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'msg' => $e->getMessage()],500);
        }
    }

    //delete message
    public function DeleteMessage(Request $request)
    {
        try {
            $chat = Chat::findOrFail($request->id);
            $chat->delete();
            event (new MessageDeleteEvent($request->id));
            return response()->json(['success' => true, 'data' => 'deleted message successfully'],200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'msg' => $e->getMessage()],500);
        }
    }

    // edit message
    public function EditMessage(Request $request)
    {
        try {
            $chat = Chat::findOrFail($request->id);
            $chat->update(['message'=> $request->message]);
            event (new MessageEditEvent($chat));
            return response()->json(['success' => true, 'msg' => 'updated message successfully'],200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'msg' => $e->getMessage()],500);
        }
    }

}
