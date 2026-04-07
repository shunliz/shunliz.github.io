// 树形菜单展开/收起功能
document.addEventListener('DOMContentLoaded', function() {
  var categoryItems = document.querySelectorAll('#article-tree .category-item');
  
  categoryItems.forEach(function(item) {
    var posts = item.querySelector('.category-posts');
    if (posts && posts.children.length > 0) {
      item.classList.add('has-posts');
      item.addEventListener('click', function(e) {
        // 如果点击的是链接，不触发展开
        if (e.target.tagName === 'A') return;
        
        item.classList.toggle('expanded');
        var display = posts.style.display;
        posts.style.display = (display === 'block') ? 'none' : 'block';
      });
    }
  });
});