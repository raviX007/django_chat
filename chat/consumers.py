import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import Message

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            # Check if user is authenticated
            if not self.scope["user"].is_authenticated:
                await self.close()
                return

            # Get users from the room name and decode it
            self.room_name = self.scope['url_route']['kwargs']['room_name']
            self.room_group_name = f'chat_{self.room_name}'
            
            # Join room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            
            await self.accept()
            print(f"WebSocket connected: {self.room_group_name} for user {self.scope['user'].username}")
            
        except Exception as e:
            print(f"Error in connect: {str(e)}")
            await self.close()

    async def disconnect(self, close_code):
        try:
            if hasattr(self, 'room_group_name'):
                await self.channel_layer.group_discard(
                    self.room_group_name,
                    self.channel_name
                )
                print(f"WebSocket disconnected: {self.room_group_name}")
        except Exception as e:
            print(f"Error in disconnect: {str(e)}")

    async def receive(self, text_data):
        if not self.scope["user"].is_authenticated:
            await self.close()
            return

        try:
            data = json.loads(text_data)
            message = data['message']
            receiver = data['receiver']
            sender = self.scope["user"].username

            # Save message
            saved_message = await self.save_message(sender, receiver, message)
            if not saved_message:
                return

            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'sender': sender
                }
            )
            
        except Exception as e:
            print(f"Error in receive: {str(e)}")
            await self.send(text_data=json.dumps({
                'error': str(e)
            }))

    async def chat_message(self, event):
        try:
            await self.send(text_data=json.dumps({
                'message': event['message'],
                'sender': event['sender']
            }))
        except Exception as e:
            print(f"Error in chat_message: {str(e)}")

    @database_sync_to_async
    def save_message(self, sender_username, receiver_username, message):
        try:
            sender = User.objects.get(username=sender_username)
            receiver = User.objects.get(username=receiver_username)
            return Message.objects.create(
                sender=sender,
                receiver=receiver,
                content=message
            )
        except Exception as e:
            print(f"Error saving message: {str(e)}")
            return None