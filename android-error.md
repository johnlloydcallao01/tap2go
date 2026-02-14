PS C:\Users\User\Desktop\tap2go\apps\mobile-customer> pnpm expo run:android
env: load .env.local
env: export EXPO_PUBLIC_API_URL EXPO_PUBLIC_PAYLOAD_API_KEY EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
› Building app...
Configuration on demand is an incubating feature.

> Configure project :
[ExpoRootProject] Using the following versions:
  - buildTools:  35.0.0
  - minSdk:      24pp
  - compileSdk:  35
  - targetSdk:   35
  - ndk:         27.1.12297006
  - kotlin:      2.1.20
  - ksp:         2.1.20-2.0.1

> Configure project :app
 ??  Applying gradle plugin 'expo-dev-launcher-gradle-plugin'

> Configure project :expo

Using expo modules
  - expo-constants (18.0.13)
  - expo-dev-client (6.0.20)
  - expo-dev-launcher (6.0.20)
  - expo-dev-menu (7.0.18)
  - expo-dev-menu-interface (2.0.0)
  - expo-json-utils (0.15.0)
  - expo-manifests (1.0.10)
  - expo-modules-core (3.0.29)
  - expo-updates-interface (2.0.0)
  - [?] expo-asset (12.0.12)
  - [?] expo-file-system (19.0.21)
  - [?] expo-font (14.0.11)
  - [?] expo-keep-awake (15.0.8)
  - [?] expo-linear-gradient (15.0.8)
  - [?] expo-linking (8.0.11)
  - [?] expo-navigation-bar (5.0.10)
  - [?] expo-system-ui (6.0.9)


> Task :react-native-worklets:configureCMakeDebug[arm64-v8a] FAILED

> Task :app:processDebugMainManifest
C:\Users\User\Desktop\tap2go\apps\mobile-customer\android\app\src\debug\AndroidManifest.xml:6:5-162 Warning:  
        application@android:usesCleartextTraffic was tagged at AndroidManifest.xml:6 to replace other declarations but no other declaration present
C:\Users\User\Desktop\tap2go\apps\mobile-customer\android\app\src\debug\AndroidManifest.xml Warning:
        provider#expo.modules.filesystem.FileSystemFileProvider@android:authorities was tagged at AndroidManifest.xml:0 to replace other declarations but no other declaration present

> Task :expo-modules-core:compileDebugJavaWithJavac
Note: Some input files use or override a deprecated API.
Note: Recompile with -Xlint:deprecation for details.                                                          

[Incubating] Problems report is available at: file:///C:/Users/User/Desktop/tap2go/apps/mobile-customer/android/build/reports/problems/problems-report.html

FAILURE: Build failed with an exception.

* What went wrong:                                                                                            
Execution failed for task ':react-native-worklets:configureCMakeDebug[arm64-v8a]'.
> [CXX1428] exception while building Json A problem occurred starting process 'command '"C:\Users\User\Desktop\tap2go\node_modules\.pnpm\react-native-worklets@0.5.1_@babel+core@7.28.4_react-native@0.81.5_@babel+core@7.28.4_@react-_qjoo7fwpziofydrfz775oyjs4a\node_modules\react-native-worklets\android\build\intermediates\cxx\Debug\702oc6q3\logs\arm64-v8a\prefab_command.bat"'' : org.gradle.process.internal.ExecException: A problem occurred starting process 'command '"C:\Users\User\Desktop\tap2go\node_modules\.pnpm\react-native-worklets@0.5.1_@babel+core@7.28.4_react-native@0.81.5_@babel+core@7.28.4_@react-_qjoo7fwpziofydrfz775oyjs4a\node_modules\react-native-worklets\android\build\intermediates\cxx\Debug\702oc6q3\logs\arm64-v8a\prefab_command.bat"''
        at org.gradle.process.internal.DefaultExecHandle.execExceptionFor(DefaultExecHandle.java:241)
        at org.gradle.process.internal.DefaultExecHandle.setEndStateInfo(DefaultExecHandle.java:218)
        at org.gradle.process.internal.DefaultExecHandle.failed(DefaultExecHandle.java:396)
        at org.gradle.process.internal.ExecHandleRunner.lambda$run$3(ExecHandleRunner.java:102)
        at org.gradle.internal.operations.CurrentBuildOperationRef.with(CurrentBuildOperationRef.java:85)     
        at org.gradle.process.internal.ExecHandleRunner.run(ExecHandleRunner.java:101)
        at org.gradle.internal.concurrent.ExecutorPolicy$CatchAndRecordFailures.onExecute(ExecutorPolicy.java:64)
        at org.gradle.internal.concurrent.AbstractManagedExecutor$1.run(AbstractManagedExecutor.java:48)      
        at java.base/java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1136)
        at java.base/java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:635)
        at java.base/java.lang.Thread.run(Thread.java:840)
  Caused by: net.rubygrapefruit.platform.NativeException: Could not start '"C:\Users\User\Desktop\tap2go\node_modules\.pnpm\react-native-worklets@0.5.1_@babel+core@7.28.4_react-native@0.81.5_@babel+core@7.28.4_@react-_qjoo7fwpziofydrfz775oyjs4a\node_modules\react-native-worklets\android\build\intermediates\cxx\Debug\702oc6q3\logs\arm64-v8a\prefab_command.bat"'
        at net.rubygrapefruit.platform.internal.DefaultProcessLauncher.start(DefaultProcessLauncher.java:27)  
        at net.rubygrapefruit.platform.internal.WindowsProcessLauncher.start(WindowsProcessLauncher.java:22)  
        at net.rubygrapefruit.platform.internal.WrapperProcessLauncher.start(WrapperProcessLauncher.java:36)  
        at org.gradle.process.internal.ExecHandleRunner.startProcess(ExecHandleRunner.java:122)
        at org.gradle.process.internal.ExecHandleRunner.lambda$run$0(ExecHandleRunner.java:80)
        at org.gradle.internal.operations.CurrentBuildOperationRef.with(CurrentBuildOperationRef.java:85)     
        at org.gradle.process.internal.ExecHandleRunner.run(ExecHandleRunner.java:79)
        ... 5 more
  Caused by: java.io.IOException: Cannot run program ""C:\Users\User\Desktop\tap2go\node_modules\.pnpm\react-native-worklets@0.5.1_@babel+core@7.28.4_react-native@0.81.5_@babel+core@7.28.4_@react-_qjoo7fwpziofydrfz775oyjs4a\node_modules\react-native-worklets\android\build\intermediates\cxx\Debug\702oc6q3\logs\arm64-v8a\prefab_command.bat"" (in directory "C:\Users\User\Desktop\tap2go\node_modules\.pnpm\react-native-worklets@0.5.1_@babel+core@7.28.4_react-native@0.81.5_@babel+core@7.28.4_@react-_qjoo7fwpziofydrfz775oyjs4a\node_modules\react-native-worklets\android"): CreateProcess error=2, The system cannot find the file specified
        at java.base/java.lang.ProcessBuilder.start(ProcessBuilder.java:1143)
        at java.base/java.lang.ProcessBuilder.start(ProcessBuilder.java:1073)
        at net.rubygrapefruit.platform.internal.DefaultProcessLauncher.start(DefaultProcessLauncher.java:25)  
        ... 11 more
  Caused by: java.io.IOException: CreateProcess error=2, The system cannot find the file specified
        at java.base/java.lang.ProcessImpl.create(Native Method)
        at java.base/java.lang.ProcessImpl.<init>(ProcessImpl.java:505)
        at java.base/java.lang.ProcessImpl.start(ProcessImpl.java:158)
        at java.base/java.lang.ProcessBuilder.start(ProcessBuilder.java:1110)
        ... 13 more


* Try:
> Run with --stacktrace option to get the stack trace.
> Run with --info or --debug option to get more log output.
> Run with --scan to get full insights.
> Get more help at https://help.gradle.org.

Deprecated Gradle features were used in this build, making it incompatible with Gradle 9.0.

You can use '--warning-mode all' to show the individual deprecation warnings and determine if they come from your own scripts or plugins.

For more on this, please refer to https://docs.gradle.org/8.14.3/userguide/command_line_interface.html#sec:command_line_warnings in the Gradle documentation.

BUILD FAILED in 1m 40s
397 actionable tasks: 13 executed, 384 up-to-date
Error: C:\Users\User\Desktop\tap2go\apps\mobile-customer\android\gradlew.bat app:assembleDebug -x lint -x test --configure-on-demand --build-cache -PreactNativeDevServerPort=8081 -PreactNativeArchitectures=x86_64,arm64-v8a exited with non-zero code: 1
Error: C:\Users\User\Desktop\tap2go\apps\mobile-customer\android\gradlew.bat app:assembleDebug -x lint -x test --configure-on-demand --build-cache -PreactNativeDevServerPort=8081 -PreactNativeArchitectures=x86_64,arm64-v8a exited with non-zero code: 1
    at ChildProcess.completionListener (C:\Users\User\Desktop\tap2go\node_modules\.pnpm\@expo+spawn-async@1.7.2\node_modules\@expo\spawn-async\src\spawnAsync.ts:67:13)
    at Object.onceWrapper (node:events:623:26)
    at ChildProcess.emit (node:events:508:28)
    at ChildProcess.cp.emit (C:\Users\User\Desktop\tap2go\node_modules\.pnpm\cross-spawn@7.0.6\node_modules\cross-spawn\lib\enoent.js:34:29)
    at maybeClose (node:internal/child_process:1101:16)
    at Process.ChildProcess._handle.onexit (node:internal/child_process:305:5)
    ...
    at spawnAsync (C:\Users\User\Desktop\tap2go\node_modules\.pnpm\@expo+spawn-async@1.7.2\node_modules\@expo\spawn-async\src\spawnAsync.ts:28:21)
    at spawnGradleAsync (C:\Users\User\Desktop\tap2go\node_modules\.pnpm\@expo+cli@54.0.23_expo-router@6.0.23_expo@54.0.33_graphql@16.11.0_react-native@0.81.5_@babel+_dgcakol2cpm6lrjypjgwp5qnj4\node_modules\@expo\cli\src\start\platforms\android\gradle.ts:134:28)
    at assembleAsync (C:\Users\User\Desktop\tap2go\node_modules\.pnpm\@expo+cli@54.0.23_expo-router@6.0.23_expo@54.0.33_graphql@16.11.0_react-native@0.81.5_@babel+_dgcakol2cpm6lrjypjgwp5qnj4\node_modules\@expo\cli\src\start\platforms\android\gradle.ts:83:16)
    at runAndroidAsync (C:\Users\User\Desktop\tap2go\node_modules\.pnpm\@expo+cli@54.0.23_expo-router@6.0.23_expo@54.0.33_graphql@16.11.0_react-native@0.81.5_@babel+_dgcakol2cpm6lrjypjgwp5qnj4\node_modules\@expo\cli\src\run\android\runAndroidAsync.ts:62:24)
PS C:\Users\User\Desktop\tap2go\apps\mobile-customer> pnpm expo run:android
env: load .env.local
env: export EXPO_PUBLIC_API_URL EXPO_PUBLIC_PAYLOAD_API_KEY EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
› Building app...
Configuration on demand is an incubating feature.

> Configure project :
[ExpoRootProject] Using the following versions:
  - buildTools:  35.0.0
  - minSdk:      24
  - compileSdk:  35
  - targetSdk:   35
  - ndk:         27.1.12297006
  - kotlin:      2.1.20
  - ksp:         2.1.20-2.0.1

> Configure project :app
 ??  Applying gradle plugin 'expo-dev-launcher-gradle-plugin'

[Incubating] Problems report is available at: file:///C:/Users/User/Desktop/tap2go/apps/mobile-customer/android/build/reports/problems/problems-report.html

FAILURE: Build failed with an exception.

* Where:
Build file 'C:\Users\User\Desktop\tap2go\apps\mobile-customer\android\app\build.gradle' line: 63

* What went wrong:
A problem occurred evaluating project ':app'.
> C:\tmp\Tap2Go Customer\Tap2Go Customer\generated\autolinking\autolinking.json (The system cannot find the path specified)

* Try:
> Run with --stacktrace option to get the stack trace.
> Run with --info or --debug option to get more log output.
> Run with --scan to get full insights.
> Get more help at https://help.gradle.org.

Deprecated Gradle features were used in this build, making it incompatible with Gradle 9.0.

You can use '--warning-mode all' to show the individual deprecation warnings and determine if they come from your own scripts or plugins.

For more on this, please refer to https://docs.gradle.org/8.14.3/userguide/command_line_interface.html#sec:command_line_warnings in the Gradle documentation.

BUILD FAILED in 33s
28 actionable tasks: 28 up-to-date
Error: C:\Users\User\Desktop\tap2go\apps\mobile-customer\android\gradlew.bat app:assembleDebug -x lint -x test --configure-on-demand --build-cache -PreactNativeDevServerPort=8081 -PreactNativeArchitectures=x86_64,arm64-v8a exited with non-zero code: 1
Error: C:\Users\User\Desktop\tap2go\apps\mobile-customer\android\gradlew.bat app:assembleDebug -x lint -x test --configure-on-demand --build-cache -PreactNativeDevServerPort=8081 -PreactNativeArchitectures=x86_64,arm64-v8a exited with non-zero code: 1
    at ChildProcess.completionListener (C:\Users\User\Desktop\tap2go\node_modules\.pnpm\@expo+spawn-async@1.7.2\node_modules\@expo\spawn-async\src\spawnAsync.ts:67:13)
    at Object.onceWrapper (node:events:623:26)
    at ChildProcess.emit (node:events:508:28)
    at ChildProcess.cp.emit (C:\Users\User\Desktop\tap2go\node_modules\.pnpm\cross-spawn@7.0.6\node_modules\cross-spawn\lib\enoent.js:34:29)
    at maybeClose (node:internal/child_process:1101:16)
    at Process.ChildProcess._handle.onexit (node:internal/child_process:305:5)
    ...
    at spawnAsync (C:\Users\User\Desktop\tap2go\node_modules\.pnpm\@expo+spawn-async@1.7.2\node_modules\@expo\spawn-async\src\spawnAsync.ts:28:21)
    at spawnGradleAsync (C:\Users\User\Desktop\tap2go\node_modules\.pnpm\@expo+cli@54.0.23_expo-router@6.0.23_expo@54.0.33_graphql@16.11.0_react-native@0.81.5_@babel+_dgcakol2cpm6lrjypjgwp5qnj4\node_modules\@expo\cli\src\start\platforms\android\gradle.ts:134:28)
    at assembleAsync (C:\Users\User\Desktop\tap2go\node_modules\.pnpm\@expo+cli@54.0.23_expo-router@6.0.23_expo@54.0.33_graphql@16.11.0_react-native@0.81.5_@babel+_dgcakol2cpm6lrjypjgwp5qnj4\node_modules\@expo\cli\src\start\platforms\android\gradle.ts:83:16)
    at runAndroidAsync (C:\Users\User\Desktop\tap2go\node_modules\.pnpm\@expo+cli@54.0.23_expo-router@6.0.23_expo@54.0.33_graphql@16.11.0_react-native@0.81.5_@babel+_dgcakol2cpm6lrjypjgwp5qnj4\node_modules\@expo\cli\src\run\android\runAndroidAsync.ts:62:24)
PS C:\Users\User\Desktop\tap2go\apps\mobile-customer> 