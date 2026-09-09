-- Source for the "Mashghal Launch" helper app. It does nothing but register
-- the mashghal-launch:// URL scheme and, when handed a URL like
-- mashghal-launch://Inkscape, run `open -a Inkscape`.
--
-- Exists because Mashghal's own server runs inside a Docker container (see
-- ../Dockerfile) and has no way to launch a native app on the host directly.
-- A custom URL scheme lets a plain link in the dashboard (opened by the
-- browser, on the host) do it instead - no container-to-host bridge needed.
--
-- Rebuild after editing with ./install-launch-handler.sh.

on open location theURL
	set appName to my decodeAppName(theURL)
	if appName is not "" then
		try
			do shell script "open -a " & quoted form of appName
		end try
	end if
end open location

on decodeAppName(theURL)
	set schemePrefix to "mashghal-launch://"
	if theURL does not start with schemePrefix then return ""
	set encodedName to text ((length of schemePrefix) + 1) thru -1 of theURL
	return my urlDecode(encodedName)
end decodeAppName

on urlDecode(theText)
	set theText to my replaceText(theText, "+", " ")
	set theText to my replaceText(theText, "%20", " ")
	return theText
end urlDecode

on replaceText(theText, searchString, replacementString)
	set {tid, AppleScript's text item delimiters} to {AppleScript's text item delimiters, searchString}
	set theItems to text items of theText
	set AppleScript's text item delimiters to replacementString
	set theText to theItems as text
	set AppleScript's text item delimiters to tid
	return theText
end replaceText
