<?php

namespace App\Http\Controllers;

use App\Events\DeleteRequestEvent;
use App\Models\Chat;
use App\Models\User;
use App\Events\MessageEvent;
use Illuminate\Http\Request;
use App\Models\RequestMessage;
use App\Events\MessageEditEvent;
use App\Events\MessageDeleteEvent;
use App\Events\RequestEvent;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function UserList()
    {
        $users = User::whereNotIn('id',[auth()->user()->id])->get();
        return view('dashboard',compact('users'));
    }

    // send messages
    public function Message(Request $request)
    {
        try {
            $chat = Chat::create([
                'sender_id' => $request->sender_id,
                'receiver_id' => $request->receiver_id,
                'message' => $request->message,
            ]);

            event (new MessageEvent($chat));
            return response()->json(['success' => true, 'data' => $chat]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'msg' => $e->getMessage()]);
        }
    }


    //old messages
    public function Loading(Request $request)
    {
        try {
            $filter_chat = Chat::where(function($query) use ($request){
                $query->where('sender_id','=',$request->sender_id)
                ->orWhere('sender_id','=',$request->receiver_id);
            })->where(function($query) use ($request){
                $query->where('receiver_id','=',$request->receiver_id)
                ->orWhere('receiver_id','=',$request->sender_id);
            })->get();

            return response()->json(['success' => true, 'data' => $filter_chat]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'msg' => $e->getMessage()]);
        }
    }

    // delete message
    public function Delete(Request $request)
    {
        try {
            Chat::where('id',$request->id)->delete();
            event (new MessageDeleteEvent($request->id));
            return response()->json(['success' => true, 'data' => 'deleted message successfully']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'data' => $e->getMessage()]);
        }
    }

    //edit message
    public function Edit(Request $request)
    {
        try {
            Chat::where('id',$request->id)->update(["message" => $request->message]);
            $chat = Chat::where('id',$request->id)->first();
            event (new MessageEditEvent($chat));
            return response()->json(['success' => true, 'msg' => 'updated message successfully']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'msg' => $e->getMessage()]);
        }
    }

    /* ------

        Request Accept Reject path 

    */

    // Request to send message
    public function MessageRequest(Request $request)
    {
        try {
            $message_request = RequestMessage::create([
                'sender_id' => Auth::id(),
                "receiver_id" => $request->receiver_id,
                "status" => $request->status,
            ]);
            event(new RequestEvent($message_request));
            return response()->json(['success'=> true, 'msg' => $message_request]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'msg' => $e->getMessage()]);
        }
    }

    // delete requested data 
    public function DeleteRequest(Request $request)
    {
        try {
            RequestMessage::where('id',$request->id)->delete();
            event(new DeleteRequestEvent($request->all()));
            return response()->json(['success' => true, 'data' => $request->all()]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'msg' => $e->getMessage()]);
        }
    }

    // load old requested data
    public function LoadingRequest(Request $request)
    {
        $request_data = RequestMessage::where('sender_id',Auth::id())
                    ->orWhere('receiver_id',Auth::id())->get();
        try {
            return response()->json(['success' => true, 'data' => $request_data]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'msg' => $e->getMessage()]);
        }
    }

    // Update Request Message
    public function UpdateRequest(Request $request)
    {
        // $request_data = RequestMessage::where()
        $request_data = RequestMessage::findOrFail($request->id);
        $request_data->update([
            'status' => $request->status,
        ]);
        if($request->status == 'reject'){
            return response()->json(['success'=> true , 'data' => $request->all()]);
        }

    }

}
