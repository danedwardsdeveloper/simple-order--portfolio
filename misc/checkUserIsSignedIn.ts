/*

Typed route for checking a user is signed in and the account is valid

const { extractedUserId, status, message } = await extractIdFromRequestCookie(request)

if (!extractedUserId) {
    return NextResponse.json({ message }, { status })
}

const { userExists } = await checkUserExists(extractedUserId)
if (!userExists) {
    return NextResponse.json({ message: tokenMessages.userNotFound }, { status: httpStatus.http401unauthorised })
}
*/