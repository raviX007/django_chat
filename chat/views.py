from django.contrib.auth import login, authenticate, logout
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.models import User
from django.contrib import messages
from django.db import IntegrityError
from .models import Message
from django.http import JsonResponse

def index(request):
    if request.user.is_authenticated:
        return redirect('chat')
    return redirect('login')

def login_view(request):
    if request.user.is_authenticated:
        return redirect('chat')
    
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('chat')
            else:
                form.add_error(None, "Invalid username or password")
    else:
        form = AuthenticationForm()
    return render(request, 'chat/login.html', {'form': form})

def logout_view(request):
    logout(request)
    return redirect('login')

def register(request):
    if request.user.is_authenticated:
        return redirect('chat')
    
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            try:
                user = form.save()
                messages.success(request, 'Registration successful! Please login with your credentials.')
                return redirect('login')
            except IntegrityError:
                messages.error(request, 'Username already exists. Please choose a different one.')
            except Exception as e:
                messages.error(request, 'An error occurred during registration. Please try again.')
        else:
            for field in form:
                for error in field.errors:
                    messages.error(request, f"{field.label}: {error}")
    else:
        form = UserCreationForm()
    
    return render(request, 'chat/register.html', {'form': form})

@login_required
def chat(request):
    users = User.objects.exclude(username=request.user.username)
    context = {
        'current_user': request.user,
        'users': users,
    }
    return render(request, 'chat/chat.html', context)

def health(request):
    return JsonResponse({"status": "Service is up and running."})