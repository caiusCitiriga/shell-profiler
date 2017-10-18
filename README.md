# Shell Profiler
### Say goodbye to your old and ugly ***.bashrc*** file!
Ever found yourself creating an amazing ***.bashrc*** file full of aliases, functions and exports on your machine? And suddently when switching to another bash capable machine, all those aliases, functions and exports aren't available? Unless you copy that file on the new machine of course? How frustrating is it?

With **ShellProfiler** you can manage your bash profile/s in a smart way. It syncs your profile/s on GitHub using Gists, and allows you to switch between a profile and another at any time. It's meant to be cross-platform, which means that you can use it safely on **OSX**, **Linux** and **Windows** (you need to have a bash installed). It offers a CLI interface for **C.R.U.D** operations over **functions**, **aliases** and **exports**.


# How does it work?
Once installed, run the ***init*** command:
```
sp init
```
This will start a procedure that will ask you 3 informations:
+ Your GitHub authorization token (needed to manage the gist), if you don't have one just go on GitHub, on the authorization tokens page, create a new token with the Gists scope only.

+ Your GitHub username

+ The path to your main .bashrc file

Once you've provided all the informations and reviewed them, the initialization procedure starts.  
ShellProfiler creates it own folder called **.shell_profiler** inside your ***HOME*** directory, storing in there all its files.  

---
**In Windows the directory will be**  
```C:\Users\<your_username>\.bash_profiler```

**In OSX the directory will be**  
```/Users/<your_username>/.shell_profiler```

**In Linux the directory will be**  
```/home/<your_username>/.shell_profiler```  

---

## Which kind of files are stored in that folder?

***shell_profiler.auth.json***  
This file contains the auth data for GitHub. Your **token** and your **username**.  


***shell_profiler.data.json***  
This file contains your **aliases**, **functions** and **exports** in a practical JSON format. It also holds the path to the user's **.bashrc** main file and the name of the Gist in use.