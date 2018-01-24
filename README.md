# **{SP}** ShellProfiler

## <blockquote>Where's the gain of using ShellProfiler?</blockquote>
Ever found yourself creating an amazing ***.bashrc*** file full of aliases, functions and exports on your machine? And suddenly when switching to another machine, all those aliases, functions and exports aren't available unless you copy that file on the new machine, of course. Also, if you need to add, delete or edit an existing item, you'll have to open up your .bashrc file, edit it, close it, and source it again. How frustrating is it? **A LOT**  
At least for me, the laziest developer ever :P

With **ShellProfiler** you can manage your bash profiles in a smart way. It syncs your profiles on GitHub using Gists, and allows you to switch between a profile and another at any time. It's meant to be cross-platform, which means that you can use it safely on **OSX**, **Linux** and **Windows** (you need to have a bash installed). It offers a CLI interface for **C.R.U.D** operations over **functions**, **aliases** and **exports**.

What do I mean with manage your bash profiles in a smar way? You won't have to open your .bashrc file anymore. You can add, edit and delete your aliases, functions and exports directly from the CLI. **SP** will ask you for a **name**, a **description** and a **body**. 

Pretty cool uh?

## <blockquote>How does it work?</blockquote>
```sh
# Install shell-profiler globally using NPM
npm i -g shell-profiler

# Once installed run the init command
sp init

# To see a full list of commands, just run sp
sp
```
The ```sp init``` command will start a procedure that will ask you the basic initialization informations. See the ***available commands*** for more details.  
**SP** creates its own folder called **.shell_profiler** inside your ***HOME*** directory. It will store all its core files inside.  

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
**SP** is wired with GitHub, that's why it asks you your GitHub username and Token. Whenever you perform a **C.R.U.D** (Create, Read, Update, Delete) operation on any of your items (aliases, functions or exports), your Gist will be automatically updated.  

When you initialize **SP** for the first time on a machine providing your token and username, **SP** will look on GitHub for any profile already saved. If one or more profiles are found, **SP** will present a list from which you can choose the profile you want to use. However, you can switch your profiles anytime.  

If no profiles are found during the initialization, a new profile will be created. **SP** will ask you for the new profile name, you can type in any name you want. Or just press ENTER to use **DefaultProfile** as name.

When you load a profile from GitHub, this will be stored locally on your machine in **JSON** format. If you disconnect your machine from the network, **SP** will continue functioning, but any communication with GitHub will be disabled. You can still add, delete and edit your items, and when the network connection will be available, all your changes will be pushed to GitHub.  

**Just remember that when you're offline you won't have the ability to switch profile, the one loaded will remain till the connection won't be available again**

## <blockquote>Available commands</blockquote>

### **init**
This command initializes ShellProfiler. It will guide you through a step by step procedure, asking you all the needed configuration data:
+ **Domain user or not:** if ran from a Windows enviroment, it will ask you if your user is part of a **DOMAIN**
+ **Domain user folder name:** if you belong to a **DOMAIN**, type in the **exact** domain user folder name. For example: ```caiuscitiriga.DOMAIN```
+ **GitHub authorization token:** the token you've created on GitHub with Gists scope. This is needed to authorize any **C.R.U.D** operation on your profile items
+ **GitHub username:** your GitHub username. **Just your username, not your email.** It will be used to access the right Gists and search your profiles only inside your user's scope.
+ **Your bashrc file absolute path:** this is the **absolute** path to your original .bashrc file. This information is needed by **SP** in order to add a ```source``` command inside of it. The command will source the internal **SP** ***.bashrc*** file, contained inside the core folder.

It will then use your username to look on GitHub for any stored profile. If one or more profiles are found, it will list each one asking you to choose which one to use. If no profiles are found, it will automatically ask you for a new profile name. You can pass any name you want, or just press ENTER and use the default name, which is **DefaultProfile**.  

**Note that even if one or more profiles are found on GitHub you can alway decide to create a new one by typing N.**  
If you choose to use an existing profile, **SP** will gather the data for that profile and store it locally. Then it will set that profile as **currently in use**. You can switch it anytime.  
If you decide to create a new one instead, or no profiles are found on GitHub, it will create a new profile locally and then push it on GitHub. Even in this case, the profile will be set as **currently in use**

### **stat**
Performs a full check over its core files. Verifying that all the core files are present, and that all the basic information needed are present.  

If everything ends fine, a success message will be presented, otherwise a error message will be presented. If this command fails, the safest thing you can do is to run the ```init``` command again.

### **ls**
Stands for ***list***, and can take several options.
+ ```ls --profile``` gets a list of all the profiles on GitHub, and prompts the user to select one.

+ ```ls --alias``` prints a list of all the available aliases managed by **SP**
+ ```ls --func``` prints a list of all the available functions managed by **SP**

### **set**
Allows you to set various **SP**'s configurations, or to create or update an alias, function or export. Takes several options divided in two categories. ***Simple options***, and ***Composite options***.  

**Simple options** requires more than one information from the user to get the job done. A simple option takes just the ***command*** and the ***flag***. For example: ```sp set --alias```. Since this command needs several informations from the user it will start prompting a series of questions.

**Composite options** requires just one information from the user to get the job done. This information is passed concatenating a semicolon ```:``` after the flag, followed by the concerned value. For example: ```sp set --username:caiuscitiriga```

#### Simple options
+ ```set --func```: creates a new function with the given name, if it does not exist yet. Otherwise the value of the existing one is updated.  

+ ```set --alias```: creates a new alias with the given name, if it does not exist yet. Otherwise the value of the existing one is updated.

+ ```set --profile```: it will list all the available profiles on GitHub. Then it will prompt you for which one you'd like to use. The switch is blazing fast.

#### Composite options
+ ```set --username:value``` sets the GitHub username value. Be aware that if you change your username, the current token won't work anymore.

+ ```set --token:value``` sets the GitHub authorization token value. Be aware that if you change your token, the current username might not work.  

**Note that when updating an existing function, alias or export, even if SP will ask for the description, this one will be ignored, and the old one will remain untouched.**  

### **del**
+ ```--alias```: lists all the available aliases, then prompts the user for the alias number to delete.
+ ```--func```: lists all the available functions, then prompts the user for the alias number to delete.

## <blockquote>Known limitations</blockquote>
Although I'm doing my best with **SP**, it still has some limitations. Some of them will remain, and some will be patched in the upcoming releases.  

### **Functions body in one line**
When setting a **function** that is very complex, right now you will have to do it on a single line. There's currently no way to span your function body on more than one line. Don't use the ***newline*** character (```\n```), it won't be respected, and worst of all it will be inserted as plain text inside your function body, potentially causing some problems while executing it.

### **Users in domain doesn't work properly in Windows**
During the **init** command, if the **user** that's logged in belongs to a domain, **SP** won't be able to detect its right User folder. So when it will try to source its core file on your main **.bashrc**, it will point to a non accessible folder.  
Suppose you're having theese two folders inside your **\Users** folder and you're logged in with the first one:

+ C:\Users\caiuscitiriga.DOMAIN
+ C:\Users\caiuscitiriga

When **SP** will open the **.bashrc** file inside \caiuscitiriga.DOMAIN, it will write inside this line:  
```sh
# It converts the path in a Linux-like way even on Windows for the bash.
source /c/Users/caiuscitiriga/.bash_profile
```

This is because it's using the Node's ```os.userInfo().username``` to retrieve your username.  
For some reason Node thinks that the user is the second one, instead of the first one.  
**SP** will ask you if you're in domain whenever it will detect that you run the ```init``` command in **Windows**. If you will say **yes** it will ask you for the right user folder (watch the casing).

### **Each ```init``` command creates a duplicate ```source``` entry in your .bashrc**
This is an easy fix to implement, and it will be patched in the upcoming releases. For now, just remember to clear your duplicates after each ```init```

### **There's no way to delete a profile yet**
In the next releases a flag will be added to the ```del``` command, which will allow the user to choose the profile to delete. For now, you cannot delete a profile 

---

## <blockquote>Requirements</blockquote>
+ ### Node 8.x.x

## Help ShellProfiler grow
If you like this project please help me with your feedback, leave a star :) Found a bug? Want a feature? Want some help? Feel free to open a [Issue on GitHub](https://github.com/caiuscitiriga/smart-cli/issues).

## Versioning
We use [SemVer](http://semver.org/) for versioning. 

## Authors
* [**Caius Citiriga**](https://github.com/caiuscitiriga)

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details