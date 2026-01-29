package com.teryaev.netwalk
import android.content.pm.ActivityInfo
import android.content.res.Configuration
import android.graphics.Color
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.ViewGroup
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.enableEdgeToEdge
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import android.view.ViewGroup.LayoutParams.MATCH_PARENT
import com.teryaev.netwalk.BuildConfig
import android.widget.Toast

//const val urlGame: String  = "https://netwalker-8eab9.web.app/"
//const val urlGame: String  = "http://10.0.2.2:5173/";
const val urlGame: String  = "https://netwalk-prime.web.app/";
const val urlError: String  = "file:///android_asset/offline.html"

class MainActivity : ComponentActivity() {
    private var currentTopPaddingDp = 0f
    private var currentBottomPaddingDp = 0f

    private fun orientationSetup() {
        val screenLayout = resources.configuration.screenLayout and Configuration.SCREENLAYOUT_SIZE_MASK
        val isTablet = screenLayout >= Configuration.SCREENLAYOUT_SIZE_LARGE
        requestedOrientation = if (isTablet) ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED else
            ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
    }

    private fun injectSafeAreas(webView: WebView?) {
        val js = """
        window.androidVersionName = '${BuildConfig.VERSION_NAME}';
        document.documentElement.style.setProperty('--safe-area-top', '${currentTopPaddingDp}px');
        document.documentElement.style.setProperty('--safe-area-bottom', '${currentBottomPaddingDp}px');
        
    """.trimIndent()
        webView?.evaluateJavascript(js, null)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        orientationSetup()
        val windowInsetsController = WindowCompat.getInsetsController(window, window.decorView)
        windowInsetsController.isAppearanceLightStatusBars = false
        windowInsetsController.isAppearanceLightNavigationBars = true
        //val defaultUserAgent = settings.userAgentString
        val webView = WebView(this).apply {
            layoutParams = ViewGroup.LayoutParams(MATCH_PARENT, MATCH_PARENT)
            setBackgroundColor(Color.parseColor("#007744"))
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
            settings.cacheMode=WebSettings.LOAD_CACHE_ELSE_NETWORK
            //settings.cacheMode=WebSettings.LOAD_DEFAULT

            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                    val url = request?.url?.toString() ?: return false
                    // Logic: If the URL is NOT your game or local error page, open it externally
                    if (!url.startsWith(urlGame) && !url.startsWith("file:///android_asset/")) {
                        val intent = android.content.Intent(android.content.Intent.ACTION_VIEW, request.url)
                        startActivity(intent)
                        return true // "true" means we handled it, don't load in WebView
                    }
                    return false // "false" means let the WebView load it normally
                }

                override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                    super.onReceivedError(view, request, error)
                    if (request?.isForMainFrame != true) return
                    val errorCode = error?.errorCode
                    val description = error?.description.toString()

                    if (errorCode == ERROR_CONNECT ||
                        errorCode == ERROR_HOST_LOOKUP ||
                        errorCode == ERROR_TIMEOUT ||
                        description.contains("ERR_ADDRESS_UNREACHABLE")) {
                        view?.loadUrl(urlError)
                        Handler(Looper.getMainLooper()).postDelayed({ view?.loadUrl(urlGame)}, 5000)
                        //Toast.makeText(this@MainActivity, "Error: ${error?.description}", Toast.LENGTH_SHORT).show()
                    }
                   // Toast.makeText(this@MainActivity, "Error: ${error?.description}", Toast.LENGTH_LONG).show()
                }
                override fun onPageCommitVisible(view: WebView?, url: String?) {
                    super.onPageCommitVisible(view, url)
                    injectSafeAreas(view as WebView)
                    view.clearHistory()
                }

            }
        }

        setContentView(webView)

        //to activate safe-insets for webview
        ViewCompat.setOnApplyWindowInsetsListener(webView) { v, windowInsets ->
            val insets = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars())
            val density = resources.displayMetrics.density
            currentTopPaddingDp = insets.top / density
            currentBottomPaddingDp = insets.bottom / density
            injectSafeAreas(webView)
            WindowInsetsCompat.CONSUMED
        }

        //to make back button work in webview
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                   moveTaskToBack(true)
                }
            }
        })

        webView.loadUrl(urlGame)
        return;
    }
}
