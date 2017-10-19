# ShellProfiler [SP]
## (Still a work in progress. Not production ready)
### Say goodbye to your old and ugly ***.bashrc*** file!
Ever found yourself creating an amazing ***.bashrc*** file full of aliases, functions and exports on your machine? And suddently when switching to another bash capable machine, all those aliases, functions and exports aren't available unless you copy that file on the new machine, of course. How frustrating is it?

With **ShellProfiler** you can manage your bash profiles in a smart way. It syncs your profiles on GitHub using Gists, and allows you to switch between a profile and another at any time. It's meant to be cross-platform, which means that you can use it safely on **OSX**, **Linux** and **Windows** (you need to have a bash installed). It offers a CLI interface for **C.R.U.D** operations over **functions**, **aliases** and **exports**.

## <blockquote>How does it work?</blockquote>
```sh
# Install shell-profiler globally using NPM
npm i -g shell-profiler

# Once installed run the init command
sp init

# To see a full list of commands, just run sp
sp
```
The ```sp init``` command will start a procedure that will ask you 3 informations:
+ **Your GitHub authorization token** (needed to manage the gist), if you don't have one just go on GitHub, on the authorization tokens page and create a new token with the Gists scope only. Copy the token and give it to **SP**

+ **Your GitHub username**

+ **The path to your main .bashrc file** this information is needed by **SP** in order to insert a ***source*** command inside your main profile, the one that the bash reads by default when booting up. The source command that will write inside will point to a core file. This file is managed by **SP**.

Once you've provided all the informations and reviewed them, the initialization procedure starts.  
**SP** creates its own folder called **.shell_profiler** inside your ***HOME*** directory. Inside, will store all its core files.  

---
**In Windows the directory will be**  
```C:\Users\<your_username>\.bash_profiler```

**In OSX the directory will be**  
```/Users/<your_username>/.shell_profiler```

**In Linux the directory will be**  
```/home/<your_username>/.shell_profiler```  

---

## <blockquote>Which kind of files are stored in the core folder?</blockquote>

***shell_profiler.auth.json***  
This file contains the auth data for GitHub. Your **token** and your **username**, eventually will store a list of **gists paths** of each profile you have. Allowing you to switch trough them anytime.

***shell_profiler.data.json***  
This file contains your **aliases**, **functions** and **exports** in JSON format. It also holds the path to the user's **.bashrc** main file and the name of the Gist in use. Generally this file is used by **SP** itself to ease the operations through the CLI.

***shell_profiler_bashrc***  
This is the file that contains all your **aliases**, **functions** and **exports** written in a "bash source capable" way. It's  basically the old **.bashrc**. The file that you were used to write by your own, now is fully managed by **SP**.  
***Be aware that if you manually edit that file, when the first CRUD operation will occur, your edit will be lost.***  

## <blockquote>GitHub communication and Gists storage system</blockquote>
### [This feature is still a work in progress.]


## <blockquote>Known limitations</blockquote>
Although I'm doing my best with **SP**, it still has some limitations. Some of them will remain, and some will be patched in the upcoming releases.  

### **Functions body in one line**
When setting a **function** that is very complex, right now you will have to do it on a single line. There's currently no way to span your function body on more than one line. Don't use the ***newline*** character (```\n```), it won't be respected, and worst of all it will be inserted as plain text inside your function body, potentially causing some problems while executing it.

### **Users in domain doesn't work properly in Windows**
During the **init** command, if the **user** that's logged in belongs to a domain, **SP** won't be able to detect its right User folder. So when it will try to source its core file on your main **.bashrc**, it will point to a non accessible folder.  
Suppose you're having theese two folders inside your **\Users** folder and you're logged in with the first one:

+ \caiuscitiriga.DOMAIN
+ \caiuscitiriga

When **SP** will open the **.bashrc** file inside \caiuscitiriga.DOMAIN, it will write inside this line:  
```sh
# It converts the path in a Linux-like way even on Windows for the bash.
source /c/Users/caiuscitiriga/.bash_profile
```

This is because it's using the Node's ```os.userInfo().username``` to retrieve your username.  
For some reason Node thinks that the user is the second one, instead of the first one. It can be annoying but the fix is pretty simple. Open your .bashrc file inside your right user folder, search for the SP source line and change the username with the right one.  

**Just remember to perform this edit each time you'll run the ```init``` command**  
**SP** will ask you if you're in domain whenever it will detect that you run the ```init``` command in **Windows**. If you will say **yes** it will ask you for the right user folder (watch the casing).

---

## <blockquote>Requirements</blockquote>
+ ### Node 8.x.x

## Help ShellProfiler grow
If you like this project please help me with your feedback. Found a bug? Want a feature? Want some help? Feel free to open a [Issue on GitHub](https://github.com/caiuscitiriga/smart-cli/issues).

## Versioning
We use [SemVer](http://semver.org/) for versioning. 

## Authors
* [**Caius Citiriga**](https://github.com/caiuscitiriga)

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details